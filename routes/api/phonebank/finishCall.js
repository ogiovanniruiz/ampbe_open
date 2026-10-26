const Router = require('express').Router

const finishCallService = require('../../../services/phonebank/finishCall')

module.exports = Router({ mergeParams: true }).post('/finishCall', async (req, res, next) => {
    try {
        res.send(await finishCallService.finishCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})