const Router = require('express').Router

const unlockGeometryService = require('../../../services/geometry/unlockGeometry')

module.exports = Router({ mergeParams: true }).post('/unlockGeometry', async (req, res, next) => {
    try {
        res.send(await unlockGeometryService.unlockGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
