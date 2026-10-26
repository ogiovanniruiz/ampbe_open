const Router = require('express').Router

const getNearestVoteCentersService = require('../../../services/amp/getNearestVoteCenters')

module.exports = Router({ mergeParams: true }).post('/getNearestVoteCenters', async (req, res, next) => {
    try {
        res.send(await getNearestVoteCentersService.getNearestVoteCenters(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})