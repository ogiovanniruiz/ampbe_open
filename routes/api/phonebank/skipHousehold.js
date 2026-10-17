const Router = require('express').Router

const skipHouseholdService = require('../../../services/phonebank/skipHousehold')

module.exports = Router({ mergeParams: true }).post('/skipHousehold', async (req, res, next) => {
    try {
        res.send(await skipHouseholdService.skipHousehold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})