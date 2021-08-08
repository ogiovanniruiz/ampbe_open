const Router = require('express').Router

const getNewCOIDemographicsService = require('../../../services/asset/getNewCOIDemographics')

module.exports = Router({ mergeParams: true }).post('/getNewCOIDemographics', async (req, res, next) => {
    try {
        res.send(await getNewCOIDemographicsService.getNewCOIDemographics(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})