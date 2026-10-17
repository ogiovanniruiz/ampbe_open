const Router = require('express').Router

const getTextbankReportService = require('../../../services/contactRecord/getTextbankReport')

module.exports = Router({ mergeParams: true }).post('/getTextbankReport', async (req, res, next) => {
    try {
        res.send(await getTextbankReportService.getTextbankReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})