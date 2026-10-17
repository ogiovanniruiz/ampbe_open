const Router = require('express').Router

const getActivitySurveyReportService = require('../../../services/contactRecord/getActivitySurveyReport')

module.exports = Router({ mergeParams: true }).post('/getActivitySurveyReport', async (req, res, next) => {
    try {
        res.send(await getActivitySurveyReportService.getActivitySurveyReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})