const Router = require('express').Router

const updateSubscribedStatusService = require('../../../services/organization/updateSubscribedStatus')

module.exports = Router({ mergeParams: true }).post('/updateSubscribedStatus', async (req, res, next) => {
    try {
        res.send(await updateSubscribedStatusService.updateSubscribedStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})