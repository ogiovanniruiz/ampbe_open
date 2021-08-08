const Router = require('express').Router

const hangUpNumberService = require('../../../services/phonebank/hangUpNumber')

module.exports = Router({ mergeParams: true }).post('/hangUpNumber', async (req, res, next) => {
    try {
        res.send(await hangUpNumberService.hangUpNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})