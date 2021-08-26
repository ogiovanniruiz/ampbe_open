const Router = require('express').Router

const lockGeometriesService = require('../../../services/geometry/lockGeometries')

module.exports = Router({ mergeParams: true }).post('/lockGeometries', async (req, res, next) => {
    try {
        res.send(await lockGeometriesService.lockGeometries(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
