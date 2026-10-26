const Router = require('express').Router

const getOrgSWCampaignsService = require('../../../../services/organization/signalWire/getOrgSWCampaigns')

module.exports = Router({ mergeParams: true }).post('/getOrgSWCampaigns', async (req, res, next) => {
    try {
        res.send(await getOrgSWCampaignsService.getOrgSWCampaigns(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})