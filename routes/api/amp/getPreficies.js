const Router = require('express').Router

const getSufficiesService = require('../../../services/amp/getSufficies')

module.exports = Router({ mergeParams: true }).post('/getSufficies', async (req, res, next) => {
    try {
        res.send(await getSufficiesService.getSufficies(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})