
const Router = require('express').Router

const submitPetitionSurveyResponseService = require('../../../services/petition/submitPetitionSurveyResponse')

module.exports = Router({ mergeParams: true }).post('/submitPetitionSurveyResponse', async (req, res, next) => {
    try {
        res.send(await submitPetitionSurveyResponseService.submitPetitionSurveyResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})