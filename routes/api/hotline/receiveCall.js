const Router = require('express').Router

const receiveCallService = require('../../../services/hotline/receiveCall')

module.exports = Router({ mergeParams: true }).post('/receiveCall', async (req, res, next) => {
    try {
        res.send(await receiveCallService.receiveCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})