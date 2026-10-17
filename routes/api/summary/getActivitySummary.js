
const Router = require('express').Router

const getActivitySummaryService = require('../../../services/summary/getActivitySummary')

module.exports = Router({ mergeParams: true }).post('/getActivitySummary', async (req, res, next) => {
    try {
        res.send(await getActivitySummaryService.getActivitySummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
