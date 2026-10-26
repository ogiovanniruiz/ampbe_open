const Router = require('express').Router

const updateUserService = require('../../../services/user/updateUser')

module.exports = Router({ mergeParams: true }).post('/updateUser', async (req, res, next) => {
    try {
        res.send(await updateUserService.updateUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})