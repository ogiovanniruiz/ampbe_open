const Router = require('express').Router

const createCOIService = require('../../../services/asset/createCOI')

module.exports = Router({ mergeParams: true }).post('/createCOI', async (req, res, next) => {
    try {
        res.send(await createCOIService.createCOI(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})