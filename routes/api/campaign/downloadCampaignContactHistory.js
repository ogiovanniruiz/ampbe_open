const Router = require('express').Router

const downloadCampaignContactHistoryService = require('../../../services/campaign/downloadCampaignContactHistory')

module.exports = Router({ mergeParams: true }).post('/downloadCampaignContactHistory', async (req, res, next) => {
    try {
        res.send(await downloadCampaignContactHistoryService.downloadCampaignContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
