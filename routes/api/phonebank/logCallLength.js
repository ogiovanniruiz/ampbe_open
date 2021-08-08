const Router = require('express').Router

const logCallLengthService = require('../../../services/phonebank/logCallLength')

module.exports = Router({ mergeParams: true }).post('/logCallLength', async (req, res, next) => {
    try {
        res.send(await logCallLengthService.logCallLength(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})