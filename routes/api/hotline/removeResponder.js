const Router = require('express').Router

const removeResponderService = require('../../../services/hotline/removeResponder')

module.exports = Router({ mergeParams: true }).post('/removeResponder', async (req, res, next) => {
    try {
        res.send(await removeResponderService.removeResponder(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})