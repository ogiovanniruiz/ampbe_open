const Router = require('express').Router

const createAlertService = require('../../../services/hotline/createAlert')

module.exports = Router({ mergeParams: true }).post('/createAlert', async (req, res, next) => {
    try {
        res.send(await createAlertService.createAlert(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})