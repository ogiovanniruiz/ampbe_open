const Router = require('express').Router

const getTwilioTokenService = require('../../../../services/organization/twilio/getTwilioToken')

module.exports = Router({ mergeParams: true }).post('/getTwilioToken', async (req, res, next) => {
    try {
        res.send(await getTwilioTokenService.getTwilioToken(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})