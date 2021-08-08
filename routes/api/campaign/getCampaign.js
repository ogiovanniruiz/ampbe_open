const Router = require('express').Router

const getCampaignService = require('../../../services/campaign/getCampaign')

module.exports = Router({ mergeParams: true }).post('/getCampaign', async (req, res, next) => {
    try {
        res.send(await getCampaignService.getCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})