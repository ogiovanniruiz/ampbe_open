const Router = require('express').Router

const getMemberActivitiesService = require('../../../services/membership/getMemberActivities')

module.exports = Router({ mergeParams: true }).post('/getMemberActivities', async (req, res, next) => {
    try {
        res.send(await getMemberActivitiesService.getMemberActivities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
