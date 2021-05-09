const Router = require('express').Router

const unregisterGeometryService = require('../../../services/geometry/unregisterGeometry')

module.exports = Router({ mergeParams: true }).post('/unregisterGeometry', async (req, res, next) => {
    try {
        res.send(await unregisterGeometryService.unregisterGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
