const Router = require('express').Router

const toggleAllOrgPolygonsService = require('../../../services/campaign/toggleAllOrgPolygons')

module.exports = Router({ mergeParams: true }).post('/toggleAllOrgPolygons', async (req, res, next) => {
    try {
        res.send(await toggleAllOrgPolygonsService.toggleAllOrgPolygons(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})