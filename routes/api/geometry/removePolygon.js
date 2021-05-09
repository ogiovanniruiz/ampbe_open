const Router = require('express').Router

const removePolygonService = require('../../../services/geometry/removePolygon')

module.exports = Router({ mergeParams: true }).post('/removePolygon', async (req, res, next) => {
    try {
        res.send(await removePolygonService.removePolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
