const Router = require('express').Router

const getIncidentsService = require('../../../services/hotline/getIncidents')

module.exports = Router({ mergeParams: true }).post('/getIncidents', async (req, res, next) => {
    try {
        res.send(await getIncidentsService.getIncidents(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})