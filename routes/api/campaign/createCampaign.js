const Router = require('express').Router

const createCampaignService = require('../../../services/campaign/createCampaign')

module.exports = Router({ mergeParams: true }).post('/createCampaign', async (req, res, next) => {
    try {
        res.send(await createCampaignService.createCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})