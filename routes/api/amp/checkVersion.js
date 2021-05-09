const Router = require('express').Router

const checkVersionService = require('../../../services/amp/checkVersion')

module.exports = Router({ mergeParams: true }).post('/checkVersion', async (req, res, next) => {
    try {
        res.send(await checkVersionService.checkVersion(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})