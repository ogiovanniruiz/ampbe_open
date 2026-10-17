const Router = require('express').Router

const hangUpSWNumberService = require('../../../../services/organization/signalWire/hangUpSWNumber')

module.exports = Router({ mergeParams: true }).post('/hangUpSWNumber', async (req, res, next) => {
    try {
        res.send(await hangUpSWNumberService.hangUpSWNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})