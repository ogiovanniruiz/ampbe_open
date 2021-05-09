const Router = require('express').Router

const loadHouseHoldsService = require('../../../services/texting/loadHouseHolds')

module.exports = Router({ mergeParams: true }).post('/loadHouseHolds', async (req, res, next) => {
    try {
        res.send(await loadHouseHoldsService.loadHouseHolds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})