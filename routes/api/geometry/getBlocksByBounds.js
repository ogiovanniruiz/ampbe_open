const Router = require('express').Router

const getBlocksByBoundsService = require('../../../services/geometry/getBlocksByBounds')

module.exports = Router({ mergeParams: true }).post('/getBlocksByBounds', async (req, res, next) => {
    try {
        res.send(await getBlocksByBoundsService.getBlocksByBounds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})