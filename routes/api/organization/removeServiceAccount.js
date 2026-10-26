const Router = require('express').Router

const removeServiceAccountService = require('../../../services/organization/removeServiceAccount')

module.exports = Router({ mergeParams: true }).post('/removeServiceAccount', async (req, res, next) => {
    try {
        res.send(await removeServiceAccountService.removeServiceAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})