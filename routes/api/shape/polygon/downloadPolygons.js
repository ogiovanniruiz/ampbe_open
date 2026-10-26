const Router = require('express').Router

const downloadPolygonsService = require('../../../../services/shape/polygon/downloadPolygons')

module.exports = Router({ mergeParams: true }).post('/downloadPolygons', async (req, res, next) => {
    try {
        res.send(await downloadPolygonsService.downloadPolygons(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})