const Router = require('express').Router

const forceHangUpSWPhonenumberService = require('../../../../services/organization/signalWire/forceHangUpSWPhonenumber')

module.exports = Router({ mergeParams: true }).post('/forceHangUpSWPhonenumber', async (req, res, next) => {
    try {
        res.send(await forceHangUpSWPhonenumberService.forceHangUpSWPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})