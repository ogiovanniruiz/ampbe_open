
const Router = require('express').Router

const submitPhoneSurveyResponseService = require('../../../services/phonebank/submitPhoneSurveyResponse')

module.exports = Router({ mergeParams: true }).post('/submitPhoneSurveyResponse', async (req, res, next) => {
    try {
        res.send(await submitPhoneSurveyResponseService.submitPhoneSurveyResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})