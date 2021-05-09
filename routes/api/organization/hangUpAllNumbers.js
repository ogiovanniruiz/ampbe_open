const Router = require('express').Router

const hangUpAllNumbersService = require('../../../services/organization/hangUpAllNumbers')

module.exports = Router({ mergeParams: true }).post('/hangUpAllNumbers', async (req, res, next) => {
    try {
        res.send(await hangUpAllNumbersService.hangUpAllNumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})