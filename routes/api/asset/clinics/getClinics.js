const Router = require('express').Router

const getClinicsService = require('../../../../services/asset/clinics/getClinics')

module.exports = Router({ mergeParams: true }).post('/getClinics', async (req, res, next) => {
    try {
        res.send(await getClinicsService.getClinics(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})