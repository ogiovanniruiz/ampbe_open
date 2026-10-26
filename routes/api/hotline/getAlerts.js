const Router = require('express').Router

const getAlertsService = require('../../../services/hotline/getAlerts')

module.exports = Router({ mergeParams: true }).post('/getAlerts', async (req, res, next) => {
    try {
        res.send(await getAlertsService.getAlerts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})