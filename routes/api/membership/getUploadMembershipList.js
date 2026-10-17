const Router = require('express').Router

const getUploadMembershipListService = require('../../../services/membership/getUploadMembershipList')

module.exports = Router({ mergeParams: true }).post('/getUploadMembershipList', async (req, res, next) => {
    try {
        res.send(await getUploadMembershipListService.getUploadMembershipList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})