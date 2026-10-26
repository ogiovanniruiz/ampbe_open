const Router = require('express').Router

const getCampaignPermissionUsersService = require('../../../services/campaign/getCampaignPermissionUsers')

module.exports = Router({ mergeParams: true }).post('/getCampaignPermissionUsers', async (req, res, next) => {
    try {
        res.send(await getCampaignPermissionUsersService.getCampaignPermissionUsers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
