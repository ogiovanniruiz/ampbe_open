const Router = require('express').Router

const getPrecBlockReportService = require('../../../services/outreachReports/getPrecBlockReport')

module.exports = Router({ mergeParams: true }).post('/getPrecBlockReport', async (req, res, next) => {
    try {
        res.send(await getPrecBlockReportService.getPrecBlockReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
