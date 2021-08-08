const Router = require('express').Router

const receiveTextService = require('../../../services/texting/receiveText')

module.exports = Router({ mergeParams: true }).post('/receiveText', async (req, res, next) => {
    try {
        res.send(await receiveTextService.receiveText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})