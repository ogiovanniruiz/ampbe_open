const Router = require('express').Router

const updateTwilioAccountService = require('../../../../services/organization/twilio/updateTwilioAccount')

module.exports = Router({ mergeParams: true }).post('/updateTwilioAccount', async (req, res, next) => {
    try {
        res.send(await updateTwilioAccountService.updateTwilioAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})