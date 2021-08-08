const Router = require('express').Router

const getDistrictBounderiesService = require('../../../services/geometry/getDistrictBounderies')

module.exports = Router({ mergeParams: true }).post('/getDistrictBounderies', async (req, res, next) => {
    try {
        res.send(await getDistrictBounderiesService.getDistrictBounderies(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})