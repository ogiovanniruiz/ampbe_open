const Router = require('express').Router

const getCampaignScriptsService = require('../../../services/script/getCampaignScripts')

module.exports = Router({ mergeParams: true }).post('/getCampaignScripts', async (req, res, next) => {
    try {
        res.send(await getCampaignScriptsService.getCampaignScripts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})