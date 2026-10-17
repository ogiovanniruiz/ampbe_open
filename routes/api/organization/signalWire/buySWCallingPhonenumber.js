const Router = require('express').Router

const buySWCallingPhonenumberService = require('../../../../services/organization/signalWire/buySWCallingPhonenumber')

module.exports = Router({ mergeParams: true }).post('/buySWCallingPhonenumber', async (req, res, next) => {
    try {
        res.send(await buySWCallingPhonenumberService.buySWCallingPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})