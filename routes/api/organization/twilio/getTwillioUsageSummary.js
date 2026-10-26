const Router = require('express').Router

const getTwilioUsageSummaryService = require('../../../../services/organization/twilio/getTwilioUsageSummary')

module.exports = Router({ mergeParams: true }).post('/getTwilioUsageSummary', async (req, res, next) => {
    try {
        res.send(await getTwilioUsageSummaryService.getTwilioUsageSummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})