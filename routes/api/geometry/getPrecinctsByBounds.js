const Router = require('express').Router

const getPrecinctsByBoundsService = require('../../../services/geometry/getPrecinctsByBounds')

module.exports = Router({ mergeParams: true }).post('/getPrecinctsByBounds', async (req, res, next) => {
    try {
        res.send(await getPrecinctsByBoundsService.getPrecinctsByBounds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
