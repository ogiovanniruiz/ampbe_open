
const Router = require('express').Router

const getNonresponseSummaryService = require('../../../services/summary/getNonresponseSummary')

module.exports = Router({ mergeParams: true }).post('/getNonresponseSummary', async (req, res, next) => {
    try {
        res.send(await getNonresponseSummaryService.getNonresponseSummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
