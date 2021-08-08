const Router = require('express').Router

const callStatusService = require('../../../services/phonebank/callStatus')

module.exports = Router({ mergeParams: true }).post('/callStatus', async (req, res, next) => {
    try {
        res.send(await callStatusService.callStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})