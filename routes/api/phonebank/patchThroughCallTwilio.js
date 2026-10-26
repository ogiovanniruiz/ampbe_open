const Router = require('express').Router

const patchThroughCallTwilioService = require('../../../services/phonebank/patchThroughCallTwilio')

module.exports = Router({ mergeParams: true }).post('/patchThroughCallTwilio', async (req, res, next) => {
    try {
        res.send(await patchThroughCallTwilioService.patchThroughCallTwilio(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})