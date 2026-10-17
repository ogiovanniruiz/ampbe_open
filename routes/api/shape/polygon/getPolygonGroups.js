const Router = require('express').Router

const getPolygonUsageService = require('../../../../services/shape/polygon/getPolygonUsage')

module.exports = Router({ mergeParams: true }).post('/getPolygonUsage', async (req, res, next) => {
    try {
        res.send(await getPolygonUsageService.getPolygonUsage(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})