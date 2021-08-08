const Router = require('express').Router

const getActivityService = require('../../../services/activity/getActivity')

module.exports = Router({ mergeParams: true }).post('/getActivity', async (req, res, next) => {
    try {
        res.send(await getActivityService.getActivity(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})