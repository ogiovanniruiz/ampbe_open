const Router = require('express').Router

const appendGeoidsService = require('../../../services/amp/appendGeoids')

module.exports = Router({ mergeParams: true }).post('/appendGeoids', async (req, res, next) => {
    try {
        res.send(await appendGeoidsService.appendGeoids(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})