const Router = require('express').Router

const buyPhoneNumberService = require('../../../../services/organization/twilio/buyPhoneNumber')

module.exports = Router({ mergeParams: true }).post('/buyPhoneNumber', async (req, res, next) => {
    try {
        res.send(await buyPhoneNumberService.buyPhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})