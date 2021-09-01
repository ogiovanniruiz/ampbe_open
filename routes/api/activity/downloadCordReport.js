const Router = require('express').Router

const downloadCordReportService = require('../../../services/activity/downloadCordReport')

module.exports = Router({ mergeParams: true }).post('/downloadCordReport', async (req, res, next) => {
    try {
        res.send(await downloadCordReportService.downloadCordReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})