const Router = require('express').Router

const getCOIReportService = require('../../../services/asset/getCOIReport')

module.exports = Router({ mergeParams: true }).post('/getCOIReport', async (req, res, next) => {
    try {
        res.send(await getCOIReportService.getCOIReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})