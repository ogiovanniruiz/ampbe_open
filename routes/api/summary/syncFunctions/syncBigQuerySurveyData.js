
const Router = require('express').Router

const syncBigQuerySurveyDataService = require('../../../../services/summary/syncFunctions/syncBigQuerySurveyData')

module.exports = Router({ mergeParams: true }).post('/syncBigQuerySurveyData', async (req, res, next) => {
    try {
        res.send(await syncBigQuerySurveyDataService.syncBigQuerySurveyData(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
