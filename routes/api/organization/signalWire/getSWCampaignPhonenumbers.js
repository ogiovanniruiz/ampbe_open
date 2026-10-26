const Router = require('express').Router

const getSWCampaignPhonenumbersService = require('../../../../services/organization/signalWire/getSWCampaignPhonenumbers')

module.exports = Router({ mergeParams: true }).post('/getSWCampaignPhonenumbers', async (req, res, next) => {
    try {
        res.send(await getSWCampaignPhonenumbersService.getSWCampaignPhonenumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})