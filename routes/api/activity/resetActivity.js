const Router = require('express').Router

const resetActivityService = require('../../../services/activity/resetActivity')

module.exports = Router({ mergeParams: true }).post('/resetActivity', async (req, res, next) => {
    try {
        res.send(await resetActivityService.resetActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})