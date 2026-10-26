const Router = require('express').Router

const getCensusTractsService = require('../../../services/shape/getCensusTracts')

module.exports = Router({ mergeParams: true }).post('/getCensusTracts', async (req, res, next) => {
    try {
        res.send(await getCensusTractsService.getCensusTracts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
