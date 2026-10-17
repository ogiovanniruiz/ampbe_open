const Router = require('express').Router

const hotlineReceiveTextService = require('../../../services/hotline/hotlineReceiveText')

module.exports = Router({ mergeParams: true }).post('/hotlineReceiveText', async (req, res, next) => {
    try {
        res.send(await hotlineReceiveTextService.hotlineReceiveText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})