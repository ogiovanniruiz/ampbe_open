const Router = require('express').Router

const createSWAccountService = require('../../../../services/organization/signalWire/createSWAccount')

module.exports = Router({ mergeParams: true }).post('/createSWAccount', async (req, res, next) => {
    try {
        res.send(await createSWAccountService.createSWAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})