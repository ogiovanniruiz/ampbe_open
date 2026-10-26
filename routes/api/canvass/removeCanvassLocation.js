const Router = require('express').Router

const removeCanvassLocationService = require('../../../services/canvass/removeCanvassLocation')

module.exports = Router({ mergeParams: true }).post('/removeCanvassLocation', async (req, res, next) => {
    try {
        res.send(await removeCanvassLocationService.removeCanvassLocation(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
