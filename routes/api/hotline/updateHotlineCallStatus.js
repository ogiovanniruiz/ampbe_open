const Router = require('express').Router

const updateHotlineCallStatusService = require('../../../services/hotline/updateHotlineCallStatus')

module.exports = Router({ mergeParams: true }).post('/updateHotlineCallStatus', async (req, res, next) => {
    try {
        res.send(await updateHotlineCallStatusService.updateHotlineCallStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})