const Router = require('express').Router

const textDeliveryStatusService = require('../../../services/texting/textDeliveryStatus')

module.exports = Router({ mergeParams: true }).post('/textDeliveryStatus', async (req, res, next) => {
    try {
        await textDeliveryStatusService.textDeliveryStatus(req.body)
        res.sendStatus(200)
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
