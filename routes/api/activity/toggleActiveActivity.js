const Router = require('express').Router

const toggleActiveActivityService = require('../../../services/activity/toggleActiveActivity')

module.exports = Router({ mergeParams: true }).post('/toggleActiveActivity', async (req, res, next) => {
    try {
        res.send(await toggleActiveActivityService.toggleActiveActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})