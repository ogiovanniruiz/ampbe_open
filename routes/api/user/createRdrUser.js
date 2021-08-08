const Router = require('express').Router

const createRdrUserService = require('../../../services/user/createRdrUser')

module.exports = Router({ mergeParams: true }).post('/createRdrUser', async (req, res, next) => {
    try {
        res.send(await createRdrUserService.createRdrUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})