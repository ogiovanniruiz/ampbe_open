const Router = require('express').Router

const toggleOnDutyService = require('../../../services/hotline/toggleOnDuty')

module.exports = Router({ mergeParams: true }).post('/toggleOnDuty', async (req, res, next) => {
    try {
        res.send(await toggleOnDutyService.toggleOnDuty(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})