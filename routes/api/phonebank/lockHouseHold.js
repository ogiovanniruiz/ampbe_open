const Router = require('express').Router

const lockHouseHoldService = require('../../../services/phonebank/lockHouseHold')

module.exports = Router({ mergeParams: true }).post('/lockHouseHold', async (req, res, next) => {
    try {
        res.send(await lockHouseHoldService.lockHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})