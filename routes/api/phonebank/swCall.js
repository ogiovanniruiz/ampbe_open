const Router = require('express').Router

const swCallService = require('../../../services/phonebank/swCall')

module.exports = Router({ mergeParams: true }).post('/swCall', async (req, res, next) => {
    try {
        res.send(await swCallService.swCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})