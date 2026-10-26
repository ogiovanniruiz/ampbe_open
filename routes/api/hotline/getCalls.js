const Router = require('express').Router

const getCallsService = require('../../../services/hotline/getCalls')

module.exports = Router({ mergeParams: true }).post('/getCalls', async (req, res, next) => {
    try {
        res.send(await getCallsService.getCalls(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})