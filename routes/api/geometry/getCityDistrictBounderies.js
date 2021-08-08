const Router = require('express').Router

const getCityDistrictBounderiesService = require('../../../services/geometry/getCityDistrictBounderies')

module.exports = Router({ mergeParams: true }).post('/getCityDistrictBounderies', async (req, res, next) => {
    try {
        res.send(await getCityDistrictBounderiesService.getCityDistrictBounderies(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})