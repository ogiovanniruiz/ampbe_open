const Router = require('express').Router

const getPolygonsByIDsService = require('../../../../services/shape/polygon/getPolygonsByIDs')

module.exports = Router({ mergeParams: true }).post('/getPolygonsByIDs', async (req, res, next) => {
    try {
        res.send(await getPolygonsByIDsService.getPolygonsByIDs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})