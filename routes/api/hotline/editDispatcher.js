const Router = require('express').Router

const editDispatcherService = require('../../../services/hotline/editDispatcher')

module.exports = Router({ mergeParams: true }).post('/editDispatcher', async (req, res, next) => {
    try {
        res.send(await editDispatcherService.editDispatcher(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})