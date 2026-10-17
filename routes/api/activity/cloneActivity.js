const Router = require('express').Router

const cloneActivityService = require('../../../services/activity/cloneActivity')

module.exports = Router({ mergeParams: true }).post('/cloneActivity', async (req, res, next) => {
    try {
        res.send(await cloneActivityService.cloneActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})