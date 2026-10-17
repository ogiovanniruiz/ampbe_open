const Router = require('express').Router

const clearGroupByPrecinctService = require('../../../services/group/clearGroupByPrecinct')

module.exports = Router({ mergeParams: true }).post('/clearGroupByPrecinct', async (req, res, next) => {
    try {
        res.send(await clearGroupByPrecinctService.clearGroupByPrecinct(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})