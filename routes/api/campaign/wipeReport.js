const Router = require('express').Router

const wipeReportService = require('../../../services/campaign/wipeReport')

module.exports = Router({ mergeParams: true }).post('/wipeReport', async (req, res, next) => {
    try {
        res.send(await wipeReportService.wipeReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})