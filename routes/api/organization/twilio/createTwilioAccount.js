const Router = require('express').Router

const createTwilioAccountService = require('../../../../services/organization/twilio/createTwilioAccount')

module.exports = Router({ mergeParams: true }).post('/createTwilioAccount', async (req, res, next) => {
    try {
        res.send(await createTwilioAccountService.createTwilioAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})