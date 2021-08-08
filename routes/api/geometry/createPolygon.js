const Router = require('express').Router

const createPolygonService = require('../../../services/geometry/createPolygon')

module.exports = Router({ mergeParams: true }).post('/createPolygon', async (req, res, next) => {
    try {
        res.send(await createPolygonService.createPolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
