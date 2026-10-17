const Router = require('express').Router

const getSurveyService = require('../../../services/survey/getSurvey')

module.exports = Router({ mergeParams: true }).post('/getSurvey', async (req, res, next) => {
    try {
        res.send(await getSurveyService.getSurvey(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})