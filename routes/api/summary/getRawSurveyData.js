
const Router = require('express').Router

const getRawSurveyDataService = require('../../../services/summary/getRawSurveyData')

module.exports = Router({ mergeParams: true }).post('/getRawSurveyData', async (req, res, next) => {
    try {
        res.send(await getRawSurveyDataService.getRawSurveyData(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
