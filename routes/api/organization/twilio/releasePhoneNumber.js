const Router = require('express').Router

const releasePhoneNumberService = require('../../../../services/organization/twilio/releasePhoneNumber')

module.exports = Router({ mergeParams: true }).post('/releasePhoneNumber', async (req, res, next) => {
    try {
        res.send(await releasePhoneNumberService.releasePhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})