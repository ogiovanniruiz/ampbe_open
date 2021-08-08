const Router = require('express').Router

const getCOIService = require('../../../services/asset/getCOI')

module.exports = Router({ mergeParams: true }).post('/getCOI', async (req, res, next) => {
    try {
        res.send(await getCOIService.getCOI(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})
