
const Router = require('express').Router

const syncGoogleSheetsService = require('../../../../services/summary/syncFunctions/syncGoogleSheets')

module.exports = Router({ mergeParams: true }).post('/syncGoogleSheets', async (req, res, next) => {
    try {
        res.send(await syncGoogleSheetsService.syncGoogleSheets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
