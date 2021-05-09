const Router = require('express').Router

const createUserService = require('../../../services/user/createUser')

module.exports = Router({ mergeParams: true }).post('/createUser', async (req, res, next) => {
    try {
        res.send(await createUserService.createUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})