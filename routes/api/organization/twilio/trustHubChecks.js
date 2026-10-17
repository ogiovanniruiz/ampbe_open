const Router = require('express').Router

const trustHubChecksService = require('../../../../services/organization/twilio/trustHubChecks')

module.exports = Router({ mergeParams: true }).post('/trustHubChecks', async (req, res, next) => {
    try {
        res.send(await trustHubChecksService.trustHubChecks(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})