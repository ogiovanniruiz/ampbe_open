const Router = require('express').Router

const geocodeService = require('../../../services/amp/geocode')

module.exports = Router({ mergeParams: true }).post('/geocode', async (req, res, next) => {
    try {
        res.send(await geocodeService.geocode(req.body.address))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})