const Router = require('express').Router

const outgoingHotlineCallService = require('../../../services/hotline/outgoingHotlineCall')

module.exports = Router({ mergeParams: true }).post('/outgoingHotlineCall', async (req, res, next) => {
    try {
        res.send(await outgoingHotlineCallService.outgoingHotlineCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})