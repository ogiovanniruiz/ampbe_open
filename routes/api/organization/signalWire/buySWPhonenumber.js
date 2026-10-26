const Router = require('express').Router

const buySWPhonenumberService = require('../../../../services/organization/signalWire/buySWPhonenumber')

module.exports = Router({ mergeParams: true }).post('/buySWPhonenumber', async (req, res, next) => {
    try {
        res.send(await buySWPhonenumberService.buySWPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})