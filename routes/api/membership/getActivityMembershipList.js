const Router = require('express').Router

const getActivityMembershipListService = require('../../../services/membership/getActivityMembershipList')

module.exports = Router({ mergeParams: true }).post('/getActivityMembershipList', async (req, res, next) => {
    try {
        res.send(await getActivityMembershipListService.getActivityMembershipList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})