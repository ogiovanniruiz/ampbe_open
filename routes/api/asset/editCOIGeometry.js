const Router = require('express').Router

const editCOIGeometryService = require('../../../services/asset/editCOIGeometry')

module.exports = Router({ mergeParams: true }).post('/editCOIGeometry', async (req, res, next) => {
    try {
        res.send(await editCOIGeometryService.editCOIGeometry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})