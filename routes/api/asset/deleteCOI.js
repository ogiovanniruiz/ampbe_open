const Router = require('express').Router

const deleteCOIService = require('../../../services/asset/deleteCOI')

module.exports = Router({ mergeParams: true }).post('/deleteCOI', async (req, res, next) => {
    try {
        res.send(await deleteCOIService.deleteCOI(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})