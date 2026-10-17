const Router = require('express').Router

const getMemberHistoryService = require('../../../services/membership/getMemberHistory')

module.exports = Router({ mergeParams: true }).post('/getMemberHistory', async (req, res, next) => {
    try {
        res.send(await getMemberHistoryService.getMemberHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
