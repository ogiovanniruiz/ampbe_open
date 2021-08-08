const Router = require('express').Router

const getCampaignRequestsService = require('../../../services/campaign/getCampaignRequests')

module.exports = Router({ mergeParams: true }).post('/getCampaignRequests', async (req, res, next) => {
    try {
        res.send(await getCampaignRequestsService.getCampaignRequests(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})