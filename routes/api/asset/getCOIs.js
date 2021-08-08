const Router = require('express').Router

const getCOIsService = require('../../../services/asset/getCOIs')

module.exports = Router({ mergeParams: true }).post('/getCOIs', async (req, res, next) => {
    try {
        res.send(await getCOIsService.getCOIs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})