const Router = require('express').Router

const getDistrictsService = require('../../../services/campaign/getDistricts')

module.exports = Router({ mergeParams: true }).post('/getDistricts', async (req, res, next) => {
    try {
        res.send(await getDistrictsService.getDistricts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
