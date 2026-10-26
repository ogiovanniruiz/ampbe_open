const Router = require('express').Router

const getSWUsageSummaryService = require('../../../../services/organization/signalWire/getSWUsageSummary')

module.exports = Router({ mergeParams: true }).post('/getSWUsageSummary', async (req, res, next) => {
    try {
        res.send(await getSWUsageSummaryService.getSWUsageSummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})