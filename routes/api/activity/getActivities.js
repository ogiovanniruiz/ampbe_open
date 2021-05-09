const Router = require('express').Router

const getActivitiesService = require('../../../services/activity/getActivities')

module.exports = Router({ mergeParams: true }).post('/getActivities', async (req, res, next) => {
    try {
        res.send(await getActivitiesService.getActivities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})