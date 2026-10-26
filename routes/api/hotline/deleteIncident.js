const Router = require('express').Router

const deleteIncidentService = require('../../../services/hotline/deleteIncident')

module.exports = Router({ mergeParams: true }).post('/deleteIncident', async (req, res, next) => {
    try {
        res.send(await deleteIncidentService.deleteIncident(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})