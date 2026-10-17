const Router = require('express').Router

const getStateDistrictService = require('../../../../services/shape/district/getStateDistrict')

module.exports = Router({ mergeParams: true }).post('/getStateDistrict', async (req, res, next) => {
    try {
        res.send(await getStateDistrictService.getStateDistrict(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
