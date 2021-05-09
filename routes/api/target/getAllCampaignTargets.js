const Router = require('express').Router

const getAllCampaignTargetsService = require('../../../services/target/getAllCampaignTargets')

module.exports = Router({ mergeParams: true }).post('/getAllCampaignTargets', async (req, res, next) => {
    try {
        res.send(await getAllCampaignTargetsService.getAllCampaignTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
