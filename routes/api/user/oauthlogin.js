const Router = require('express').Router

const oauthLoginService = require('../../../services/user/oauthLogin')

module.exports = Router({ mergeParams: true }).post('/oauthLogin', async (req, res, next) => {
    try {
        res.send(await oauthLoginService.oauthLogin(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})