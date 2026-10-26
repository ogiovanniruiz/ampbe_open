
const Router = require('express').Router

const getAnalysisSummaryService = require('../../../services/summary/getAnalysisSummary')

module.exports = Router({ mergeParams: true }).post('/getAnalysisSummary', async (req, res, next) => {
    try {
        res.send(await getAnalysisSummaryService.getAnalysisSummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
