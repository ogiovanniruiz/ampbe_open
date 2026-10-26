const Router = require('express').Router

const getNumRespondersService = require('../../../services/hotline/getNumResponders')

module.exports = Router({ mergeParams: true }).post('/getNumResponders', async (req, res, next) => {
    try {
        res.send(await getNumRespondersService.getNumResponders(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})