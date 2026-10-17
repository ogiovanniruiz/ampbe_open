const Router = require('express').Router

const getCampaignHouseholdsService = require('../../../services/group/getCampaignHouseholds')

module.exports = Router({ mergeParams: true }).post('/getCampaignHouseholds', async (req, res, next) => {
    try {
        res.send(await getCampaignHouseholdsService.getCampaignHouseholds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
