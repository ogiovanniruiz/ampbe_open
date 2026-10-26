const Router = require('express').Router

const getLiveSBResultsService = require('../../../services/amp/getLiveSBResults')

module.exports = Router({ mergeParams: true }).post('/getLiveSBResults', async (req, res, next) => {
    try {
        res.send(await getLiveSBResultsService.getLiveSBResults(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})