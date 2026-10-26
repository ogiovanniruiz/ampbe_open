const Router = require('express').Router

const dbHealthCheckService = require('../../../services/amp/dbHealthCheck')

module.exports = Router({ mergeParams: true }).get('/dbHealthCheck', async (req, res, next) => {
    try {
        res.send(await dbHealthCheckService.dbHealthCheck(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})