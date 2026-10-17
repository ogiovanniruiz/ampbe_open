const Router = require('express').Router

const getLiveSOSResultsService = require('../../../services/amp/getLiveSOSResults')

module.exports = Router({ mergeParams: true }).post('/getLiveSOSResults', async (req, res, next) => {
    try {
        res.send(await getLiveSOSResultsService.getLiveSOSResults(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})