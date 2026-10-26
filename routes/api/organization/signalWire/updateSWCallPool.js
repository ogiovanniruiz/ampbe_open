const Router = require('express').Router

const updateSWCallPoolService = require('../../../../services/organization/signalWire/updateSWCallPool')

module.exports = Router({ mergeParams: true }).post('/updateSWCallPool', async (req, res, next) => {
    try {
        res.send(await updateSWCallPoolService.updateSWCallPool(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})