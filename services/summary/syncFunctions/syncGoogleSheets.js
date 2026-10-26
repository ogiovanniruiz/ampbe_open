const { getSheetsClient, getSpreadsheetID } = require('./sheetsClient')
const GetRawSurveyData = require('../getRawSurveyData')

const syncGoogleSheets = async(detail) => {

    let data_object_array = await GetRawSurveyData.getRawSurveyData(detail)

    const values = toSheetValues(data_object_array);

    const spreadsheetId = getSpreadsheetID(detail.googleSheetURL);

    const range = 'Sheet1!A1';

    const client = await getSheetsClient(detail.orgID);
    if (!client) {
        console.error(`Org ${detail.orgID} has no service account key; Google Sheet sync skipped`);
        return false;
    }
    const { sheets } = client;

    try {

        const res = await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: values,
          },
        });


        return true
    } catch (error) {
        console.error('Error inserting rows:', error)
        return false
    }

}

function toSheetValues(data, columns, { includeHeader = true } = {}) {
  if (!Array.isArray(data)) throw new Error('data must be an array');

  // Normalize columns to [{ header, path }]
  let cols;
  if (!columns) {
    const set = new Set();
    for (const o of data) Object.keys(o || {}).forEach(k => set.add(k));
    cols = [...set].map(k => ({ header: k, path: k }));
  } else if (Array.isArray(columns)) {
    cols = columns.map(k => ({ header: k, path: k }));
  } else {
    // mapping: { Header: path }
    cols = Object.entries(columns).map(([header, path]) => ({ header, path }));
  }

  const header = cols.map(c => c.header);

  const rows = data.map(obj =>
    cols.map(c => stringifyCell(deepGet(obj, c.path)))
  );

  return includeHeader ? [header, ...rows] : rows;
}

function deepGet(obj, path) {
  if (!obj || !path) return '';
  if (!path.includes('.')) return obj[path] ?? '';
  return path.split('.').reduce((acc, k) => (acc == null ? '' : acc[k]), obj) ?? '';
}

function stringifyCell(v) {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v); // flatten objects safely
  return String(v);
}

module.exports = {syncGoogleSheets}