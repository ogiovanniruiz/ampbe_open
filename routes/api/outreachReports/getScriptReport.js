const Router = require('express').Router

const getScriptReportService = require('../../../services/outreachReports/getScriptReport')

module.exports = Router({ mergeParams: true }).post('/getScriptReport', async (req, res, next) => {
    try {
        res.send(await getScriptReportService.getScriptReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
