const Router = require('express').Router

const getEstimateService = require('../../../services/target/getEstimate')

module.exports = Router({ mergeParams: true }).post('/getEstimate', async (req, res, next) => {
    try {
        res.send(await getEstimateService.getEstimate(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})