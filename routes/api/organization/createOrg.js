const Router = require('express').Router

const createOrgService = require('../../../services/organization/createOrg')

module.exports = Router({ mergeParams: true }).post('/createOrg', async (req, res, next) => {
    try {
        res.send(await createOrgService.createOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})