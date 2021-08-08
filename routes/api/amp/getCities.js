const Router = require('express').Router

const getCitiesService = require('../../../services/amp/getCities')

module.exports = Router({ mergeParams: true }).post('/getCities', async (req, res, next) => {
    try {
        res.send(await getCitiesService.getCities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})