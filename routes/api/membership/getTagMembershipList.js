const Router = require('express').Router

const getTagMembershipListService = require('../../../services/membership/getTagMembershipList')

module.exports = Router({ mergeParams: true }).post('/getTagMembershipList', async (req, res, next) => {
    try {
        res.send(await getTagMembershipListService.getTagMembershipList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})