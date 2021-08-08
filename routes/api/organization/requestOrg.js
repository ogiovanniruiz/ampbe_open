const Router = require('express').Router

const requestOrgService = require('../../../services/organization/requestOrg')

module.exports = Router({ mergeParams: true }).post('/requestOrg', async (req, res, next) => {
    try {
        res.send(await requestOrgService.requestOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})