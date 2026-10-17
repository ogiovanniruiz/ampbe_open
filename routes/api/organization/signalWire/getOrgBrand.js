const Router = require('express').Router

const getOrgBrandService = require('../../../../services/organization/signalWire/getOrgBrand')

module.exports = Router({ mergeParams: true }).post('/getOrgBrand', async (req, res, next) => {
    try {
        res.send(await getOrgBrandService.getOrgBrand(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})