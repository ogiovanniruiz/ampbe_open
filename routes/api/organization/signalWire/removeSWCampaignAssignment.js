const Router = require('express').Router

const removeSWCampaignAssignmentService = require('../../../../services/organization/signalWire/removeSWCampaignAssignment')

module.exports = Router({ mergeParams: true }).post('/removeSWCampaignAssignment', async (req, res, next) => {
    try {
        res.send(await removeSWCampaignAssignmentService.removeSWCampaignAssignment(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})