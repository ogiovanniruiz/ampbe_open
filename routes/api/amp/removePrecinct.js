const Router = require('express').Router

const removePrecinctService = require('../../../services/amp/removePrecinct')

module.exports = Router({ mergeParams: true }).post('/removePrecinct', async (req, res, next) => {
    try {
        res.send(await removePrecinctService.removePrecinct(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})