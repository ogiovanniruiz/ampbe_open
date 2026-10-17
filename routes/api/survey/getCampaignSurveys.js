const Router = require('express').Router

const getCampaignSurveysService = require('../../../services/survey/getCampaignSurveys')

module.exports = Router({ mergeParams: true }).post('/getCampaignSurveys', async (req, res, next) => {
    try {
        res.send(await getCampaignSurveysService.getCampaignSurveys(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})