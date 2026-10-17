const Router = require('express').Router

const getUserMembershipListService = require('../../../services/membership/getUserMembershipList')

module.exports = Router({ mergeParams: true }).post('/getUserMembershipList', async (req, res, next) => {
    try {
        res.send(await getUserMembershipListService.getUserMembershipList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
