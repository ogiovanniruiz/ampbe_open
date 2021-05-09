const Router = require('express').Router

const setNewPasswordService = require('../../../services/user/setNewPassword')

module.exports = Router({ mergeParams: true }).post('/setNewPassword', async (req, res, next) => {
    try {
        res.send(await setNewPasswordService.setNewPassword(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
