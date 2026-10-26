const Router = require('express').Router

const createActivityService = require('../../../services/activity/createActivity')

module.exports = Router({ mergeParams: true }).post('/createActivity', async (req, res, next) => {
    try {
        res.send(await createActivityService.createActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})