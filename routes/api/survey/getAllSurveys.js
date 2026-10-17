const Router = require('express').Router

const getAllSurveysService = require('../../../services/survey/getAllSurveys')

module.exports = Router({ mergeParams: true }).post('/getAllSurveys', async (req, res, next) => {
    try {
        res.send(await getAllSurveysService.getAllSurveys(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})