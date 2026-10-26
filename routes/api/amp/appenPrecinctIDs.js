const Router = require('express').Router

const appendPrecinctIDsService = require('../../../services/amp/appendPrecinctIDs')

module.exports = Router({ mergeParams: true }).post('/appendPrecinctIDs', async (req, res, next) => {
    try {
        res.send(await appendPrecinctIDsService.appendPrecinctIDs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})