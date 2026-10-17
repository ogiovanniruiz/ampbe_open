const Router = require('express').Router

const checkSWAccountService = require('../../../../services/organization/signalWire/checkSWAccount')

module.exports = Router({ mergeParams: true }).post('/checkSWAccount', async (req, res, next) => {
    try {
        res.send(await checkSWAccountService.checkSWAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})