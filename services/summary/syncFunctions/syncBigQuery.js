const { getBigQueryClient } = require('./googleKey')
const ActivityContactRecord = require('../../../models/activities/activityContactRecord')
const Organizations = require('../../../models/organizations/organization')

const datasetId = 'a_ieuef_main';
const tableId = 'c3_2026_optin_emails';

// C3 2026 General Survey; questions are matched by text since responses store the question text
const SURVEY_ID = '6ab8f65ed6efd213aacdb933'
const Q2 = 'Will you be voting?'
const Q4 = 'Optin to We Are CA/ IE United Education Fund?'

// Orgs whose contacts are left out of the opt-in sync
const EXCLUDED_ORG_IDS = ['6a064d7fb884f21453bd93dc', '5f6bb8251966920019ec5c3d']

// One row per person who said Yes to Q2 and Q4 and has an email
const schema = [
  { name: 'voterID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'pdiID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'organization', type: 'STRING', mode: 'NULLABLE' },
  { name: 'signupdate', type: 'TIMESTAMP', mode: 'NULLABLE' },
  { name: 'first_name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'last_name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'zip_code', type: 'STRING', mode: 'NULLABLE' },
  { name: 'county', type: 'STRING', mode: 'NULLABLE' },
  { name: 'email_address', type: 'STRING', mode: 'NULLABLE' },
  { name: 'phone_number', type: 'STRING', mode: 'NULLABLE' },
  { name: 'will_vote_yes', type: 'BOOLEAN', mode: 'NULLABLE' },
  { name: 'optin_yes', type: 'BOOLEAN', mode: 'NULLABLE' },
];

const str = (value) => value == null || String(value).trim() === '' ? null : String(value).trim()

const syncBigQuery = async(detail) => {

  const bigquery = await getBigQueryClient(detail.orgID)
  if (!bigquery) {
    console.error(`Org ${detail.orgID} has no service account key; BigQuery sync skipped`);
    return false;
  }

  try {
    const records = await ActivityContactRecord.find(
      {
        'surveyResponse.surveyID': SURVEY_ID,
        orgID: {$nin: EXCLUDED_ORG_IDS},
        'person.resident.emails.0': {$exists: true},
        $and: [
          {'surveyResponse.questionResponses': {$elemMatch: {question: Q4, response: 'Yes'}}},
          {'surveyResponse.questionResponses': {$elemMatch: {question: Q2, response: 'Yes'}}}
        ]
      },
      {
        orgID: 1, creationDate: 1, 'surveyResponse.questionResponses': 1,
        'person.resident.personID': 1, 'person.resident.voterID': 1, 'person.resident.pdiID': 1,
        'person.resident.name': 1, 'person.resident.emails': 1, 'person.resident.phones': 1,
        'person.address.zip': 1, 'person.county': 1
      }
    ).sort({creationDate: -1}).lean()

    const orgIDs = [...new Set(records.map(r => r.orgID).filter(Boolean))]
    const orgs = await Organizations.find({_id: {$in: orgIDs}}, {name: 1}).lean()
    const orgNames = new Map(orgs.map(org => [org._id.toString(), org.name]))

    // Records are newest first, so the first one seen per person is kept.
    // A person is a repeat if their personID or any of their emails was already seen.
    const seenPeople = new Set()
    const seenEmails = new Set()
    const rows = []
    let duplicates = 0

    for (const r of records) {
      const resident = r.person?.resident || {}
      const emails = (resident.emails || []).map(str).filter(Boolean)
      if (!emails.length) continue

      const key = str(resident.personID) || String(r._id)
      const emailKeys = emails.map(e => e.toLowerCase())
      if (seenPeople.has(key) || emailKeys.some(e => seenEmails.has(e))) { duplicates++; continue }
      seenPeople.add(key)
      emailKeys.forEach(e => seenEmails.add(e))

      const saidYes = (question) => r.surveyResponse?.questionResponses?.some(qr => qr.question === question && qr.response === 'Yes') || false

      rows.push({
        voterID: str(resident.voterID),
        pdiID: str(resident.pdiID),
        organization: str(orgNames.get(String(r.orgID))),
        signupdate: r.creationDate ? new Date(r.creationDate).toISOString() : null,
        first_name: str(resident.name?.firstName),
        last_name: str(resident.name?.lastName),
        zip_code: str(r.person?.address?.zip),
        county: str(r.person?.county),
        email_address: emails[0],
        phone_number: str(resident.phones?.[0]?.number),
        will_vote_yes: saidYes(Q2),
        optin_yes: saidYes(Q4),
      })
    }

    console.log(`Survey ${SURVEY_ID}: ${records.length} contact records, ${rows.length} people, ${duplicates} duplicates skipped`);

    // Don't let an empty sync wipe an existing table
    if (!rows.length) {
      console.log(`No rows to sync for survey ${SURVEY_ID}; BigQuery table left unchanged`);
      return false
    }

    // Load job with WRITE_TRUNCATE replaces the table (and its schema) atomically
    await loadRows(bigquery.dataset(datasetId).table(tableId), rows)

    console.log(`Loaded ${rows.length} rows into ${datasetId}.${tableId}`);
    return true

  } catch (error) {

    console.error('Error loading rows:', "Error Name:", error?.name, "Error Message:", error?.message);

    if (error?.errors?.length) {
      console.error("Load errors:", JSON.stringify(error.errors.slice(0, 10), null, 2));
    }

    return false;
  }

}

const loadRows = (table, rows) => new Promise((resolve, reject) => {
  const stream = table.createWriteStream({
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    writeDisposition: 'WRITE_TRUNCATE',
    createDisposition: 'CREATE_IF_NEEDED',
    schema: {fields: schema},
    location: 'US',
  })

  stream.on('error', reject)
  stream.on('complete', job => {
    const errors = job.metadata?.status?.errors
    if (errors?.length) {
      const err = new Error(job.metadata.status.errorResult?.message || 'Load job failed')
      err.errors = errors
      return reject(err)
    }
    resolve(job)
  })

  stream.end(rows.map(row => JSON.stringify(row)).join('\n'))
})

module.exports = {syncBigQuery}
