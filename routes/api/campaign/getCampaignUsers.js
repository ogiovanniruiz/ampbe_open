const Router = require('express').Router

const getCampaignUsersService = require('../../../services/campaign/getCampaignUsers')

module.exports = Router({ mergeParams: true }).post('/getCampaignUsers', async (req, res, next) => {
    try {
        res.send(await getCampaignUsersService.getCampaignUsers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
