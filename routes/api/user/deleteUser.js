const Router = require('express').Router

const deleteUserService = require('../../../services/user/deleteUser')

module.exports = Router({ mergeParams: true }).post('/deleteUser', async (req, res, next) => {
    try {
        res.send(await deleteUserService.deleteUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})