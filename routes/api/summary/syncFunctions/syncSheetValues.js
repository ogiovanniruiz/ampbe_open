const Router = require('express').Router

const syncSheetValuesService = require('../../../../services/summary/syncFunctions/syncSheetValues')

module.exports = Router({ mergeParams: true }).post('/syncSheetValues', async (req, res, next) => {
    try {
        res.send(await syncSheetValuesService.syncSheetValues(req.body))
    } catch(e) {
        console.log(e.message)
        if(e instanceof syncSheetValuesService.SheetSyncError) return res.status(400).send({message: e.message})
        res.sendStatus(500)
    }
})
