const Router = require('express').Router

const getTextingReportService = require('../../../services/texting/getTextingReport')

module.exports = Router({ mergeParams: true }).post('/getTextingReport', async (req, res, next) => {
    try {
        res.send(await getTextingReportService.getTextingReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})