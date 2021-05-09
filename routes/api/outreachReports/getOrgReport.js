const Router = require('express').Router

const getOrgReportService = require('../../../services/outreachReports/getOrgReport')

module.exports = Router({ mergeParams: true }).post('/getOrgReport', async (req, res, next) => {
    try {
        res.send(await getOrgReportService.getOrgReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})