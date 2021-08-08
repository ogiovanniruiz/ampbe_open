const Router = require('express').Router

const editCampaignService = require('../../../services/campaign/editCampaign')

module.exports = Router({ mergeParams: true }).post('/editCampaign', async (req, res, next) => {
    try {
        res.send(await editCampaignService.editCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})