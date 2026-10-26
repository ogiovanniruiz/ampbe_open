const Router = require('express').Router

const createSurveyService = require('../../../services/survey/createSurvey')

module.exports = Router({ mergeParams: true }).post('/createSurvey', async (req, res, next) => {
    try {
        res.send(await createSurveyService.createSurvey(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})