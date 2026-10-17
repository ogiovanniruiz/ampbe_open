
const Router = require('express').Router

const submitTextSurveyResponseService = require('../../../services/texting/submitTextSurveyResponse')

module.exports = Router({ mergeParams: true }).post('/submitTextSurveyResponse', async (req, res, next) => {
    try {
        res.send(await submitTextSurveyResponseService.submitTextSurveyResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})