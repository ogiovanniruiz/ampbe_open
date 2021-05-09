const Router = require('express').Router

const callService = require('../../../services/phonebank/call')

module.exports = Router({ mergeParams: true }).post('/call', async (req, res, next) => {
    try {
        res.send(await callService.call(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})