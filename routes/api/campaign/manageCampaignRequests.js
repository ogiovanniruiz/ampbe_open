const Router = require('express').Router

const manageCampaignRequestService = require('../../../services/campaign/manageCampaignRequest')


module.exports = Router({ mergeParams: true }).post('/manageCampaignRequest', async (req, res, next) => {
    try {
        res.send(await manageCampaignRequestService.manageCampaignRequest(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})