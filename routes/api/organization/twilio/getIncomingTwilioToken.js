const Router = require('express').Router

const getIncomingTwilioTokenService = require('../../../../services/organization/twilio/getIncomingTwilioToken')

module.exports = Router({ mergeParams: true }).post('/getIncomingTwilioToken', async (req, res, next) => {
    try {
        res.send(await getIncomingTwilioTokenService.getIncomingTwilioToken(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})