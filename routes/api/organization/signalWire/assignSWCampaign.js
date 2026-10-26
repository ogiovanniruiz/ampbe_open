const Router = require('express').Router

const assignSWCampaignService = require('../../../../services/organization/signalWire/assignSWCampaign')

module.exports = Router({ mergeParams: true }).post('/assignSWCampaign', async (req, res, next) => {
    try {
        res.send(await assignSWCampaignService.assignSWCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})