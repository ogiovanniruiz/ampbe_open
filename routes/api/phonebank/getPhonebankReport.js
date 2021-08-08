const Router = require('express').Router

const getPhonebankReportService = require('../../../services/phonebank/getPhonebankReport')

module.exports = Router({ mergeParams: true }).post('/getPhonebankReport', async (req, res, next) => {
    try {
        res.send(await getPhonebankReportService.getPhonebankReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})