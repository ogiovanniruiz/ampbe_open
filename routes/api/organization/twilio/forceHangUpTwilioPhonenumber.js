const Router = require('express').Router

const forceHangUpTwilioPhonenumberService = require('../../../../services/organization/twilio/forceHangUpTwilioPhonenumber')

module.exports = Router({ mergeParams: true }).post('/forceHangUpTwilioPhonenumber', async (req, res, next) => {
    try {
        res.send(await forceHangUpTwilioPhonenumberService.forceHangUpTwilioPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})