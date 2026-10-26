const Router = require('express').Router

const getFullDistrictsService = require('../../../services/amp/getFullDistricts')

module.exports = Router({ mergeParams: true }).post('/getFullDistricts', async (req, res, next) => {
    try {
        res.send(await getFullDistrictsService.getFullDistricts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})