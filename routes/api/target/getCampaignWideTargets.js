const Router = require('express').Router

const getCampaignWideTargetsService = require('../../../services/target/getCampaignWideTargets')

module.exports = Router({ mergeParams: true }).post('/getCampaignWideTargets', async (req, res, next) => {
    try {
        res.send(await getCampaignWideTargetsService.getCampaignWideTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})