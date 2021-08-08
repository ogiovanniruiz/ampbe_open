const Router = require('express').Router

const regenerateResidentsService = require('../../../services/amp/regenerateResidents')

module.exports = Router({ mergeParams: true }).post('/regenerateResidents', async (req, res, next) => {
    try {
        res.send(await regenerateResidentsService.regenerateResidents(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})