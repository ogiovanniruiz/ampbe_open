const Router = require('express').Router

const createDispatcherService = require('../../../services/hotline/createDispatcher')

module.exports = Router({ mergeParams: true }).post('/createDispatcher', async (req, res, next) => {
    try {
        res.send(await createDispatcherService.createDispatcher(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})