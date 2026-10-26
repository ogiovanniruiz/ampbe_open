
const Router = require('express').Router

const syncBigQueryService = require('../../../../services/summary/syncFunctions/syncBigQuery')

module.exports = Router({ mergeParams: true }).post('/syncBigQuery', async (req, res, next) => {
    try {
        res.send(await syncBigQueryService.syncBigQuery(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
