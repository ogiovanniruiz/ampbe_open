const Router = require('express').Router

const getCountyDistrictBounderiesService = require('../../../services/geometry/getCountyDistrictBounderies')

module.exports = Router({ mergeParams: true }).post('/getCountyDistrictBounderies', async (req, res, next) => {
    try {
        res.send(await getCountyDistrictBounderiesService.getCountyDistrictBounderies(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})