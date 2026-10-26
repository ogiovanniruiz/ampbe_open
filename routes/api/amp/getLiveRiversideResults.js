const Router = require('express').Router

const getLiveRiversideResultsService = require('../../../services/amp/getLiveRiversideResults')

module.exports = Router({ mergeParams: true }).post('/getLiveRiversideResults', async (req, res, next) => {
    try {
        res.send(await getLiveRiversideResultsService.getLiveRiversideResults(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})