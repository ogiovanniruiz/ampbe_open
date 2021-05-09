const Router = require('express').Router

const localLoginService = require('../../../services/user/localLogin')

module.exports = Router({ mergeParams: true }).post('/localLogin', async (req, res, next) => {
    try {
        res.send(await localLoginService.localLogin(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})