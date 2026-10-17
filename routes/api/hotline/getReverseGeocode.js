const Router = require('express').Router

const getReverseGeocodeService = require('../../../services/hotline/getReverseGeocode')

module.exports = Router({ mergeParams: true }).post('/getReverseGeocode', async (req, res, next) => {
    try {
        res.send(await getReverseGeocodeService.getReverseGeocode(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})