const Router = require('express').Router

const lockHouseholdService = require('../../../services/phonebank/lockHousehold')

module.exports = Router({ mergeParams: true }).post('/lockHousehold', async (req, res, next) => {
    try {
        res.send(await lockHouseholdService.lockHousehold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})