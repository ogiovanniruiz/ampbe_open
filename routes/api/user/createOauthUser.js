const Router = require('express').Router

const createOauthUserService = require('../../../services/user/createOauthUser')

module.exports = Router({ mergeParams: true }).post('/createOauthUser', async (req, res, next) => {
    try {
        res.send(await createOauthUserService.createOauthUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})