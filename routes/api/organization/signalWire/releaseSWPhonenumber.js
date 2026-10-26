const Router = require('express').Router

const releaseSWPhonenumberService = require('../../../../services/organization/signalWire/releaseSWPhonenumber')

module.exports = Router({ mergeParams: true }).post('/releaseSWPhonenumber', async (req, res, next) => {
    try {
        res.send(await releaseSWPhonenumberService.releaseSWPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})