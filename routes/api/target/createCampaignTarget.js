const Router = require('express').Router

const createCampaignTargetService = require('../../../services/target/createCampaignTarget')

module.exports = Router({ mergeParams: true }).post('/createCampaignTarget', async (req, res, next) => {
    try {
        res.send(await createCampaignTargetService.createCampaignTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})