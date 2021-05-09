const Router = require('express').Router

const getOrgCampaignsService = require('../../../services/campaign/getOrgCampaigns')

module.exports = Router({ mergeParams: true }).post('/getOrgCampaigns', async (req, res, next) => {
    try {
        res.send(await getOrgCampaignsService.getOrgCampaigns(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})