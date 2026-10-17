const Router = require('express').Router

const getGroupActivitiesService = require('../../../services/activity/getGroupActivities')

module.exports = Router({ mergeParams: true }).post('/getGroupActivities', async (req, res, next) => {
    try {
        res.send(await getGroupActivitiesService.getGroupActivities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})