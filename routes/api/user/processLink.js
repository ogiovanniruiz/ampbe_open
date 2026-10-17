const Router = require('express').Router

const processLinkService = require('../../../services/user/processLink')

module.exports = Router({ mergeParams: true }).post('/processLink', async (req, res, next) => {
    try {
        res.send(await processLinkService.processLink(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})