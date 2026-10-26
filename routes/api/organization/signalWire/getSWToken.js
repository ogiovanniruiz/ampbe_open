const Router = require('express').Router

const getSWTokenService = require('../../../../services/organization/signalWire/getSWToken')

module.exports = Router({ mergeParams: true }).post('/getSWToken', async (req, res, next) => {
    try {
        res.send(await getSWTokenService.getSWToken(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})