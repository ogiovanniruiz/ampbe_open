const Router = require('express').Router

const getSurveyUsageService = require('../../../services/survey/getSurveyUsage')

module.exports = Router({ mergeParams: true }).post('/getSurveyUsage', async (req, res, next) => {
    try {
        res.send(await getSurveyUsageService.getSurveyUsage(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
