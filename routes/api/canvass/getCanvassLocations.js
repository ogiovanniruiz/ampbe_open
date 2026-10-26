const Router = require('express').Router

const getCanvassLocationsService = require('../../../services/canvass/getCanvassLocations')

module.exports = Router({ mergeParams: true }).post('/getCanvassLocations', async (req, res, next) => {
    try {
        res.send(await getCanvassLocationsService.getCanvassLocations(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})