const Router = require('express').Router

const editCOIService = require('../../../services/asset/editCOI')

module.exports = Router({ mergeParams: true }).post('/editCOI', async (req, res, next) => {
    try {
        res.send(await editCOIService.editCOI(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})