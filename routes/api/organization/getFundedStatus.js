const Router = require('express').Router

const getFundedStatusService = require('../../../services/organization/getFundedStatus')

module.exports = Router({ mergeParams: true }).post('/getFundedStatus', async (req, res, next) => {
    try {
        res.send(await getFundedStatusService.getFundedStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})