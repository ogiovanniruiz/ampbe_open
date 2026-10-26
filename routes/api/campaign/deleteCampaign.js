const Router = require('express').Router

const deleteCampaignService = require('../../../services/campaign/deleteCampaign')

module.exports = Router({ mergeParams: true }).post('/deleteCampaign', async (req, res, next) => {
    try {
        res.send(await deleteCampaignService.deleteCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
