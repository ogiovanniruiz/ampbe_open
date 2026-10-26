const Router = require('express').Router

const updateCallingServiceService = require('../../../services/organization/updateCallingService')

module.exports = Router({ mergeParams: true }).post('/updateCallingService', async (req, res, next) => {
    try {
        res.send(await updateCallingServiceService.updateCallingService(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})