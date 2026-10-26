const Router = require('express').Router

const getCityShapesService = require('../../../services/shape/getCityShapes')

module.exports = Router({ mergeParams: true }).post('/getCityShapes', async (req, res, next) => {
    try {
        res.send(await getCityShapesService.getCityShapes(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
