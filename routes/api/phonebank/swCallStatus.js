
const Router = require('express').Router

const swCallStatusService = require('../../../services/phonebank/swCallStatus')

module.exports = Router({ mergeParams: true }).post('/swCallStatus', async (req, res, next) => {
    try {
        res.send(await swCallStatusService.swCallStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})