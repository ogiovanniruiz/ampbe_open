const Router = require('express').Router

const editSurveyService = require('../../../services/survey/editSurvey')

module.exports = Router({ mergeParams: true }).post('/editSurvey', async (req, res, next) => {
    try {
        res.send(await editSurveyService.editSurvey(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})