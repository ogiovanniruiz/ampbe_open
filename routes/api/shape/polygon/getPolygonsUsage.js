const Router = require('express').Router

const getPolygonsUsageService = require('../../../../services/shape/polygon/getPolygonsUsage')

module.exports = Router({ mergeParams: true }).post('/getPolygonsUsage', async (req, res, next) => {
    try {
        res.send(await getPolygonsUsageService.getPolygonsUsage(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
