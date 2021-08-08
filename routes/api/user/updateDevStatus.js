const Router = require('express').Router

const updateDevStatusService = require('../../../services/user/updateDevStatus')

module.exports = Router({ mergeParams: true }).post('/updateDevStatus', async (req, res, next) => {
    try {
        res.send(await updateDevStatusService.updateDevStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})