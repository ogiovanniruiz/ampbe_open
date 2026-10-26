const Router = require('express').Router

const getAllCampaignGroupsService = require('../../../services/group/getAllCampaignGroups')

module.exports = Router({ mergeParams: true }).post('/getAllCampaignGroups', async (req, res, next) => {
    try {
        res.send(await getAllCampaignGroupsService.getAllCampaignGroups(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
