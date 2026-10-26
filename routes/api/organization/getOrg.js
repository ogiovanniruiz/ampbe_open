const Router = require('express').Router

const getOrgService = require('../../../services/organization/getOrg')

module.exports = Router({ mergeParams: true }).post('/getOrg', async (req, res, next) => {
    try {
        res.send(await getOrgService.getOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})