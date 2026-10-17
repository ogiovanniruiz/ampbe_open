const Router = require('express').Router

const getCampaignWideGroupsService = require('../../../services/group/getCampaignWideGroups')

module.exports = Router({ mergeParams: true }).post('/getCampaignWideGroups', async (req, res, next) => {
    try {
        res.send(await getCampaignWideGroupsService.getCampaignWideGroups(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})