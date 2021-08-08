const Router = require('express').Router

const getCampaignBoundaryService = require('../../../services/campaign/getCampaignBoundary')

module.exports = Router({ mergeParams: true }).post('/getCampaignBoundary', async (req, res, next) => {
    try {
        res.send(await getCampaignBoundaryService.getCampaignBoundary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})