const Router = require('express').Router

const getActivityContactHistoryService = require('../../../services/contactRecord/getActivityContactHistory')

module.exports = Router({ mergeParams: true }).post('/getActivityContactHistory', async (req, res, next) => {
    try {
        res.send(await getActivityContactHistoryService.getActivityContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})