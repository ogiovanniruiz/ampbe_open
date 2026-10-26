const Router = require('express').Router

const createIncidentService = require('../../../services/hotline/createIncident')

module.exports = Router({ mergeParams: true }).post('/createIncident', async (req, res, next) => {
    try {
        res.send(await createIncidentService.createIncident(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})