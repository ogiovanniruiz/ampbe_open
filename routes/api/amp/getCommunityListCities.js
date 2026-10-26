const Router = require('express').Router

const getCommunityListCitiesService = require('../../../services/amp/getCommunityListCities')

module.exports = Router({ mergeParams: true }).post('/getCommunityListCities', async (req, res, next) => {
    try {
        res.send(await getCommunityListCitiesService.getCommunityListCities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})