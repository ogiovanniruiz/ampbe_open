const Router = require('express').Router

const requestCampaignService = require('../../../services/campaign/requestCampaign')

module.exports = Router({ mergeParams: true }).post('/requestCampaign', async (req, res, next) => {
    try {
        res.send(await requestCampaignService.requestCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})