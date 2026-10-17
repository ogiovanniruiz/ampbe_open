const Router = require('express').Router

const getCanvassStreetListService = require('../../../services/canvass/getCanvassStreetList')

module.exports = Router({ mergeParams: true }).post('/getCanvassStreetList', async (req, res, next) => {
    try {
        res.send(await getCanvassStreetListService.getCanvassStreetList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})