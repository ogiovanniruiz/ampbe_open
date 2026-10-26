const { google } = require('googleapis');
const { getOrgGoogleKey } = require('./googleKey')

// {sheets, clientEmail} using the org's uploaded key; undefined when the org has none.
// Sheets must be shared with clientEmail for the sync to write to them
const getSheetsClient = async(orgID) => {
    const key = await getOrgGoogleKey(orgID)
    if(!key) return undefined

    const auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return { sheets: google.sheets({ version: 'v4', auth }), clientEmail: key.client_email };
}

// https://docs.google.com/spreadsheets/d/<id>/edit -> <id>
const getSpreadsheetID = (url) => {
    try {
        return new URL(url).pathname.split('/')[3]
    } catch(e) {
        return undefined
    }
}

module.exports = {getSheetsClient, getSpreadsheetID}
