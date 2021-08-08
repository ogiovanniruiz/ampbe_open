const Router = require('express').Router

const getUserReportService = require('../../../services/outreachReports/getUserReport')

module.exports = Router({ mergeParams: true }).post('/getUserReport', async (req, res, next) => {
    try {
        res.send(await getUserReportService.getUserReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})