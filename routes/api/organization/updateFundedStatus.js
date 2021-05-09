const Router = require('express').Router

const updateFundedStatusService = require('../../../services/organization/updateFundedStatus')

module.exports = Router({ mergeParams: true }).post('/updateFundedStatus', async (req, res, next) => {
    try {
        res.send(await updateFundedStatusService.updateFundedStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})