const Router = require('express').Router

const getPolygonService = require('../../../../services/shape/polygon/getPolygon')

module.exports = Router({ mergeParams: true }).post('/getPolygon', async (req, res, next) => {
    try {
        res.send(await getPolygonService.getPolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})