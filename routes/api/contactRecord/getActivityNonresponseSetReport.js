const Router = require('express').Router

const getActivityNonresponseSetReportService = require('../../../services/contactRecord/getActivityNonresponseSetReport')

module.exports = Router({ mergeParams: true }).post('/getActivityNonresponseSetReport', async (req, res, next) => {
    try {
        res.send(await getActivityNonresponseSetReportService.getActivityNonresponseSetReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})