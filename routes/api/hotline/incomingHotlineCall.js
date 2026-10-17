const Router = require('express').Router

const incomingHotlineCallService = require('../../../services/hotline/incomingHotlineCall')

module.exports = Router({ mergeParams: true }).post('/incomingHotlineCall', async (req, res, next) => {
    try {
        res.send(await incomingHotlineCallService.incomingHotlineCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})