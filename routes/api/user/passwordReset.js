const Router = require('express').Router

const passwordResetService = require('../../../services/user/passwordReset')

module.exports = Router({ mergeParams: true }).post('/passwordReset', async (req, res, next) => {
    try {
        res.send(await passwordResetService.passwordReset(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
