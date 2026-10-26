const Router = require('express').Router

const removeDispatcherService = require('../../../services/hotline/removeDispatcher')

module.exports = Router({ mergeParams: true }).post('/removeDispatcher', async (req, res, next) => {
    try {
        res.send(await removeDispatcherService.removeDispatcher(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})