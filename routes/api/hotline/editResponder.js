const Router = require('express').Router

const editResponderService = require('../../../services/hotline/editResponder')

module.exports = Router({ mergeParams: true }).post('/editResponder', async (req, res, next) => {
    try {
        res.send(await editResponderService.editResponder(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})