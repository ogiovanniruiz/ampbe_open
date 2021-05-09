const Router = require('express').Router

const registerGeometryService = require('../../../services/geometry/registerGeometry')

module.exports = Router({ mergeParams: true }).post('/registerGeometry', async (req, res, next) => {
    try {
        res.send(await registerGeometryService.registerGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
