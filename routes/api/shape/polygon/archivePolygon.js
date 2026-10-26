const Router = require('express').Router

const archivePolygonService = require('../../../../services/shape/polygon/archivePolygon')

module.exports = Router({ mergeParams: true }).post('/archivePolygon', async (req, res, next) => {
    try {
        res.send(await archivePolygonService.archivePolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
