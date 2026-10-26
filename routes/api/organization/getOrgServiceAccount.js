const Router = require('express').Router

const getOrgServiceAccountService = require('../../../services/organization/getOrgServiceAccount')

module.exports = Router({ mergeParams: true }).post('/getOrgServiceAccount', async (req, res, next) => {
    try {
        res.send(await getOrgServiceAccountService.getOrgServiceAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})