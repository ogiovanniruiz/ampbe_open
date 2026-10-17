const Router = require('express').Router

const getElectionPrecinctsService = require('../../../services/amp/getElectionPrecincts')

module.exports = Router({ mergeParams: true }).post('/getElectionPrecincts', async (req, res, next) => {
    try {
        res.send(await getElectionPrecinctsService.getElectionPrecincts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})