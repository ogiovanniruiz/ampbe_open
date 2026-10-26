const Router = require('express').Router

const massGeocodeVotersService = require('../../../services/amp/massGeocodeVoters')

module.exports = Router({ mergeParams: true }).post('/massGeocodeVoters', async (req, res, next) => {
    try {
        res.send(await massGeocodeVotersService.massGeocodeVoters(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})