const Router = require('express').Router

const updateCampaignDefaultGroupService = require('../../../services/campaign/updateCampaignDefaultGroup')

module.exports = Router({ mergeParams: true }).post('/updateCampaignDefaultGroup', async (req, res, next) => {
    try {
        res.send(await updateCampaignDefaultGroupService.updateCampaignDefaultGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})