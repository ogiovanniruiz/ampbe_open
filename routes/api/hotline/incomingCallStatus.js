const Router = require('express').Router

const incomingCallStatusService = require('../../../services/hotline/incomingCallStatus')

module.exports = Router({ mergeParams: true }).post('/incomingCallStatus', async (req, res, next) => {
    try {
        res.send(await incomingCallStatusService.incomingCallStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})