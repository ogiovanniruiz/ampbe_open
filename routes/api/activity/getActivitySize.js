const Router = require('express').Router

const getActivitySizeService = require('../../../services/activity/getActivitySize')

module.exports = Router({ mergeParams: true }).post('/getActivitySize', async (req, res, next) => {
    try {
        res.send(await getActivitySizeService.getActivitySize(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})