const Router = require('express').Router

const skipHouseHoldService = require('../../../services/phonebank/skipHouseHold')

module.exports = Router({ mergeParams: true }).post('/skipHouseHold', async (req, res, next) => {
    try {
        res.send(await skipHouseHoldService.skipHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})