const { getSheetsClient, getSpreadsheetID } = require('./sheetsClient')

// An error the user can fix (bad link, sheet not shared); the route sends its message back
class SheetSyncError extends Error {}

// Replaces everything on the named tab (Sheet1 by default) with the given rows
const syncSheetValues = async(detail) => {

    const spreadsheetId = getSpreadsheetID(detail.googleSheetURL)
    if(!spreadsheetId) throw new SheetSyncError("That doesn't look like a Google Sheet link.")

    if(!Array.isArray(detail.values) || !detail.values.length) throw new SheetSyncError('There is nothing to sync.')

    const sheetName = (detail.sheetName || '').trim() || 'Sheet1'
    // Tab names with spaces or punctuation must be quoted, with any ' doubled
    const tab = "'" + sheetName.replace(/'/g, "''") + "'"

    const client = await getSheetsClient(detail.orgID)
    if(!client) throw new SheetSyncError('Google Sheets sync is not set up for this organization. Upload a service account key in Edit Organization.')
    const { sheets, clientEmail } = client

    try {
        // Generated tab names usually don't exist yet, so add the tab on first sync
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' })
        const tabExists = (spreadsheet.data.sheets || []).some(sheet => sheet.properties.title === sheetName)
        if(!tabExists){
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
            })
        }

        // Clear first so rows from a longer earlier sync don't linger at the bottom
        await sheets.spreadsheets.values.clear({ spreadsheetId, range: tab })

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: tab + '!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: detail.values },
        })

        return true
    } catch (error) {
        const status = error.code || error.status
        if(status === 403 || status === 404){
            throw new SheetSyncError('Could not open that sheet. Share it with ' + clientEmail + ' as an Editor.')
        }
        if(status === 400){
            throw new SheetSyncError('Could not write to that sheet.')
        }
        throw error
    }
}

module.exports = {syncSheetValues, SheetSyncError}
