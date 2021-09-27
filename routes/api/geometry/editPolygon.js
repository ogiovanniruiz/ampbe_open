const Router = require('express').Router

const editPolygonService = require('../../../services/geometry/editPolygon')

module.exports = Router({ mergeParams: true }).post('/editPolygon', async (req, res, next) => {
    try {
        res.send(await editPolygonService.editPolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})