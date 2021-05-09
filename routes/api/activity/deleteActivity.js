const Router = require('express').Router

const deleteActivityService = require('../../../services/activity/deleteActivity')

module.exports = Router({ mergeParams: true }).post('/deleteActivity', async (req, res, next) => {
    try {
        res.send(await deleteActivityService.deleteActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})