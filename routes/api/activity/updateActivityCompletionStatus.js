const Router = require('express').Router

const updateActivityCompletionStatusService = require('../../../services/activity/updateActivityCompletionStatus')

module.exports = Router({ mergeParams: true }).post('/updateActivityCompletionStatus', async (req, res, next) => {
    try {
        res.send(await updateActivityCompletionStatusService.updateActivityCompletionStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})