const Router = require('express').Router

const getPetitionReportService = require('../../../services/contactRecord/getPetitionReport')

module.exports = Router({ mergeParams: true }).post('/getPetitionReport', async (req, res, next) => {
    try {
        res.send(await getPetitionReportService.getPetitionReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})