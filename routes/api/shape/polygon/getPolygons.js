const Router = require('express').Router

const getPolygonsService = require('../../../../services/shape/polygon/getPolygons')

module.exports = Router({ mergeParams: true }).post('/getPolygons', async (req, res, next) => {
    try {
        res.send(await getPolygonsService.getPolygons(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})