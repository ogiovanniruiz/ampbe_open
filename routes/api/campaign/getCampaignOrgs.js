const Router = require('express').Router

const getCampaignOrgsService = require('../../../services/campaign/getCampaignOrgs')

module.exports = Router({ mergeParams: true }).post('/getCampaignOrgs', async (req, res, next) => {
    try {
        res.send(await getCampaignOrgsService.getCampaignOrgs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})