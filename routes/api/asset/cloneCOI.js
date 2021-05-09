const Router = require('express').Router

const cloneCOIService = require('../../../services/asset/cloneCOI')

module.exports = Router({ mergeParams: true }).post('/cloneCOI', async (req, res, next) => {
    try {
        res.send(await cloneCOIService.cloneCOI(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})