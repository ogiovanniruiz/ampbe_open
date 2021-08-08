const Router = require('express').Router

const finishGeometryService = require('../../../services/geometry/finishGeometry')

module.exports = Router({ mergeParams: true }).post('/finishGeometry', async (req, res, next) => {
    try {
        res.send(await finishGeometryService.finishGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
