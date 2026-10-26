const Router = require('express').Router

const getRespondersService = require('../../../services/hotline/getResponders')

module.exports = Router({ mergeParams: true }).post('/getResponders', async (req, res, next) => {
    try {
        res.send(await getRespondersService.getResponders(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})