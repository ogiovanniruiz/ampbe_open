const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bigquery = new BigQuery({keyFilename: path.join(__dirname, '../../../service_accounts/cali-calls-ie-node Key summer_2026.json')});
const ActivityContactRecord = require('../../../models/activities/activityContactRecord')
const Campaigns = require('../../../models/campaigns/campaign')
const Organizations = require('../../../models/organizations/organization')
const Survey = require('../../../models/surveys/survey')

const datasetId = 'a_ieuef_main';

// One row per question/response pair; non-response-only contacts get a single row with null question/response
const schema = [
  { name: 'pdiid', type: 'STRING', mode: 'REQUIRED' },
  { name: 'ampID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'voterID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'personID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'contactRecordID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'org', type: 'STRING', mode: 'NULLABLE' },
  { name: 'activityType', type: 'STRING', mode: 'NULLABLE' },
  { name: 'county', type: 'STRING', mode: 'NULLABLE' },
  { name: 'userID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'surveyID', type: 'STRING', mode: 'NULLABLE' },
  { name: 'surveyName', type: 'STRING', mode: 'NULLABLE' },
  { name: 'question', type: 'STRING', mode: 'NULLABLE' },
  { name: 'questionType', type: 'STRING', mode: 'NULLABLE' },
  { name: 'response', type: 'STRING', mode: 'NULLABLE' },
  { name: 'nonResponse', type: 'STRING', mode: 'NULLABLE' },
  { name: 'nonResponseType', type: 'STRING', mode: 'NULLABLE' },
  { name: 'creationDate', type: 'TIMESTAMP', mode: 'NULLABLE' },
];

const str = (value) => value == null || String(value).trim() === '' ? null : String(value).trim()

const syncBigQuerySurveyData = async(detail) => {

  const campaign = await Campaigns.findOne({campaignID: detail.campaignID})
  if (!campaign) {
    console.error(`Campaign ${detail.campaignID} not found`);
    return false;
  }

  const tableId = campaign.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() + '_survey_data';

  try {
    const records = await ActivityContactRecord.find(
      {campaignID: detail.campaignID, $or: [{surveyResponse: {$exists: true}}, {nonResponse: {$exists: true}}]},
      {
        orgID: 1, activityType: 1, creationDate: 1, userID: 1, surveyResponse: 1, nonResponse: 1,
        'person.resident.personID': 1, 'person.resident.ampID': 1, 'person.resident.voterID': 1,
        'person.resident.pdiID': 1, 'person.resident.pdiid': 1, 'person.county': 1
      }
    ).lean()

    const orgs = await Organizations.find({_id: {$in: campaign.orgIDs}}, {name: 1}).lean()
    const orgNames = new Map(orgs.map(org => [org._id.toString(), org.name]))

    const surveyIDs = [...new Set(records.map(r => r.surveyResponse?.surveyID).filter(Boolean))]
    const surveys = await Survey.find({_id: {$in: surveyIDs}}, {name: 1}).lean()
    const surveyNames = new Map(surveys.map(survey => [survey._id.toString(), survey.name]))

    const rows = []
    let skipped = 0

    for (const r of records) {
      const resident = r.person?.resident || {}
      const pdiid = str(resident.pdiID || resident.pdiid)
      if (!pdiid) { skipped++; continue }

      const surveyID = r.surveyResponse?.surveyID || null

      const base = {
        pdiid,
        ampID: str(resident.ampID),
        voterID: str(resident.voterID),
        personID: str(resident.personID),
        contactRecordID: String(r._id),
        org: str(orgNames.get(String(r.orgID))),
        activityType: str(r.activityType),
        county: str(r.person?.county),
        userID: str(r.userID),
        surveyID,
        surveyName: surveyID ? str(surveyNames.get(surveyID)) : null,
        nonResponse: str(r.nonResponse?.nonResponse),
        nonResponseType: str(r.nonResponse?.nonResponseType),
        creationDate: r.creationDate ? new Date(r.creationDate).toISOString() : null,
      }

      const questionResponses = r.surveyResponse?.questionResponses || []

      if (questionResponses.length) {
        for (const qr of questionResponses) {
          rows.push({...base, question: str(qr.question), questionType: str(qr.questionType), response: str(qr.response)})
        }
      } else if (r.nonResponse) {
        rows.push({...base, question: null, questionType: null, response: null})
      }
    }

    console.log(`Campaign ${detail.campaignID}: ${records.length} contact records, ${rows.length} rows, ${skipped} records skipped (missing pdiID)`);

    // Don't let an empty sync wipe an existing table
    if (!rows.length) {
      console.log(`No rows to sync for campaign ${detail.campaignID}; BigQuery table left unchanged`);
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

module.exports = {syncBigQuerySurveyData}
