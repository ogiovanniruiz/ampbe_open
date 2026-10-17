const Router = require('express').Router

const getTwilioCallPoolService = require('../../../../services/organization/twilio/getTwilioCallPool')

module.exports = Router({ mergeParams: true }).post('/getTwilioCallPool', async (req, res, next) => {
    try {
        res.send(await getTwilioCallPoolService.getTwilioCallPool(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})