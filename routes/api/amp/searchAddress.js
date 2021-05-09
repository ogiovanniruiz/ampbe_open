const Router = require('express').Router

const searchAddressService = require('../../../services/amp/searchAddress')

module.exports = Router({ mergeParams: true }).post('/searchAddress', async (req, res, next) => {
    try {
        res.send(await searchAddressService.searchAddress(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})