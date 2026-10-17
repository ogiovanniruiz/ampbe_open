var ActivityContactRecord = require('../../../models/activities/activityContactRecord')
var Organizations = require('../../../models/organizations/organization')

var Campaigns = require('../../../models/campaigns/campaign')

const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bigquery = new BigQuery({keyFilename: path.join(__dirname, '../../../service_accounts/cali-calls-ie-node Key winter_2026.json')});

const People = require('../../../models/people/people')

const syncBigQuery = async(detail) => {

    console.log("STARTING...")

    const datasetId = 'a_ieuef_main';
    const tableId = 'riverside_full_voter_list';

    var people = await People.find({county: "RIVERSIDE"}, {'resident.voterID': 1, 'resident.ampID': 1, 'county': 1}).lean()

    try {

        const rows = (people || []).map(r => ({
            voterID: r.resident.voterID == null ? null : String(r.resident.voterID).trim(),
            ampID: r.resident.ampID == null ? null : String(r.resident.ampID).trim(),
            county: r.county == null ? null : String(r.county),
        }));

        //console.log(rows)

        const bad = rows.filter(r => !r.ampID); // catches null, "", "   "
        
        if (bad.length) {
          console.error(`Invalid rows (missing ampID): ${bad.length}`);
          console.error("Example bad row:", bad[0]);
          return false;
        }

        await bigquery.dataset(datasetId).table(tableId).insert(rows, {
          skipInvalidRows: true,
          ignoreUnknownValues: false,
        });


        console.log(`Inserted ${rows.length} rows`);

        return true
    } catch (error) {
        console.error('Error inserting rows:', error?.name, error?.message);

        if (error?.errors?.length) {
            error.errors.forEach((e, idx) => {
            const badRow = typeof e.row === "function" ? e.row() : e.row;
            console.error(`RowError[${idx}] details:`, JSON.stringify(e.errors, null, 2));
            console.error(`RowError[${idx}] row:`, JSON.stringify(badRow, null, 2));
        });
  }

  if (error?.response?.insertErrors?.length) {
    console.error("insertErrors:", JSON.stringify(error.response.insertErrors, null, 2));
  }

  return false;
    }

}

module.exports = {syncBigQuery}