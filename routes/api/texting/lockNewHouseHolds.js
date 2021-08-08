const Router = require('express').Router

const lockNewHouseHoldsService = require('../../../services/texting/lockNewHouseHolds')

module.exports = Router({ mergeParams: true }).post('/lockNewHouseHolds', async (req, res, next) => {
    try {
        res.send(await lockNewHouseHoldsService.lockNewHouseHolds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})