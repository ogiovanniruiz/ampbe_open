const Router = require('express').Router

const sendInitTextService = require('../../../services/texting/sendInitText')

module.exports = Router({ mergeParams: true }).post('/sendInitText', async (req, res, next) => {
    try {
        res.send(await sendInitTextService.sendInitText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})