const Router = require('express').Router

const getAllUsersService = require('../../../services/user/getAllUsers')

module.exports = Router({ mergeParams: true }).post('/getAllUsers', async (req, res, next) => {
    try {
        res.send(await getAllUsersService.getAllUsers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})