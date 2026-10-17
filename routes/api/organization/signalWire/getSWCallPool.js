const Router = require('express').Router

const getSWCallPoolService = require('../../../../services/organization/signalWire/getSWCallPool')

module.exports = Router({ mergeParams: true }).post('/getSWCallPool', async (req, res, next) => {
    try {
        res.send(await getSWCallPoolService.getSWCallPool(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})