const Router = require('express').Router

const updateCanvassLocationService = require('../../../services/canvass/updateCanvassLocation')

module.exports = Router({ mergeParams: true }).post('/updateCanvassLocation', async (req, res, next) => {
    try {
        res.send(await updateCanvassLocationService.updateCanvassLocation(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})