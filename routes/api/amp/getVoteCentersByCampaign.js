const Router = require('express').Router

const getVoteCentersByCampaignService = require('../../../services/amp/getVoteCentersByCampaign')

module.exports = Router({ mergeParams: true }).post('/getVoteCentersByCampaign', async (req, res, next) => {
    try {
        res.send(await getVoteCentersByCampaignService.getVoteCentersByCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
