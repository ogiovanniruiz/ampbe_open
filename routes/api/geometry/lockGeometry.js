const Router = require('express').Router

const lockGeometryService = require('../../../services/geometry/lockGeometry')

module.exports = Router({ mergeParams: true }).post('/lockGeometry', async (req, res, next) => {
    try {
        res.send(await lockGeometryService.lockGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
