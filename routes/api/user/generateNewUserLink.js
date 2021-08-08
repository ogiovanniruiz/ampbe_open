const Router = require('express').Router

const generateNewUserLinkService = require('../../../services/user/generateNewUserLink')

module.exports = Router({ mergeParams: true }).post('/generateNewUserLink', async (req, res, next) => {
    try {
        res.send(await generateNewUserLinkService.generateNewUserLink(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})