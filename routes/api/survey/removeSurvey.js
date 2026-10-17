const Router = require('express').Router

const removeSurveyService = require('../../../services/survey/removeSurvey')

module.exports = Router({ mergeParams: true }).post('/removeSurvey', async (req, res, next) => {
    try {
        res.send(await removeSurveyService.removeSurvey(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})