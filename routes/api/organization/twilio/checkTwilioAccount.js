const Router = require('express').Router

const checkTwilioAccountService = require('../../../../services/organization/twilio/checkTwilioAccount')

module.exports = Router({ mergeParams: true }).post('/checkTwilioAccount', async (req, res, next) => {
    try {
        res.send(await checkTwilioAccountService.checkTwilioAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})