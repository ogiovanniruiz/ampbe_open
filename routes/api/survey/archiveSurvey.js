const Router = require('express').Router

const archiveSurveyService = require('../../../services/survey/archiveSurvey')

module.exports = Router({ mergeParams: true }).post('/archiveSurvey', async (req, res, next) => {
    try {
        res.send(await archiveSurveyService.archiveSurvey(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})