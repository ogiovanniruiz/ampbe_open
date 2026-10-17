const Router = require('express').Router

const getLiveElectionResultsService = require('../../../services/amp/getLiveElectionResults')

module.exports = Router({ mergeParams: true }).post('/getLiveElectionResults', async (req, res, next) => {
    try {
        res.send(await getLiveElectionResultsService.getLiveElectionResults(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})