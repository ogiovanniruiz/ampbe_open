const Router = require('express').Router

const massGeocodeService = require('../../../services/amp/massGeocode')

module.exports = Router({ mergeParams: true }).post('/massGeocode', async (req, res, next) => {
    try {
        res.send(await massGeocodeService.massGeocode(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})