const Router = require('express').Router

const editIncidentService = require('../../../services/hotline/editIncident')

module.exports = Router({ mergeParams: true }).post('/editIncident', async (req, res, next) => {
    try {
        res.send(await editIncidentService.editIncident(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})