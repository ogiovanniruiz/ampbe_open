const Router = require('express').Router

const getCanvassReportService = require('../../../services/canvass/getCanvassReport')

module.exports = Router({ mergeParams: true }).post('/getCanvassReport', async (req, res, next) => {
    try {
        res.send(await getCanvassReportService.getCanvassReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})