
const Router = require('express').Router

const getSurveySummaryService = require('../../../services/summary/getSurveySummary')

module.exports = Router({ mergeParams: true }).post('/getSurveySummary', async (req, res, next) => {
    try {
        res.send(await getSurveySummaryService.getSurveySummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
