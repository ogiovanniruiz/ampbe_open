const Router = require('express').Router

const getDistrictDataSummaryService = require('../../../services/summary/getDistrictDataSummary')

module.exports = Router({ mergeParams: true }).post('/getDistrictDataSummary', async (req, res, next) => {
    try {
        res.send(await getDistrictDataSummaryService.getDistrictDataSummary(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
