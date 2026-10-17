const Router = require('express').Router

const createResponderService = require('../../../services/hotline/createResponder')

module.exports = Router({ mergeParams: true }).post('/createResponder', async (req, res, next) => {
    try {
        res.send(await createResponderService.createResponder(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})