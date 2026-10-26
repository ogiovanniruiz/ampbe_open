const Router = require('express').Router

const deletePolygonService = require('../../../../services/shape/polygon/deletePolygon')

module.exports = Router({ mergeParams: true }).post('/deletePolygon', async (req, res, next) => {
    try {
        res.send(await deletePolygonService.deletePolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
