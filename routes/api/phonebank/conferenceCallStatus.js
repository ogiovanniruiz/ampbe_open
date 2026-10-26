const Router = require('express').Router

const conferenceCallStatusService = require('../../../services/phonebank/conferenceCallStatus')

module.exports = Router({ mergeParams: true }).post('/conferenceCallStatus', async (req, res, next) => {
    try {
        res.send(await conferenceCallStatusService.conferenceCallStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})