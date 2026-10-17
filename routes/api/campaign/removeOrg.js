const Router = require('express').Router

const removeOrgService = require('../../../services/campaign/removeOrg')

module.exports = Router({ mergeParams: true }).post('/removeOrg', async (req, res, next) => {
    try {
        res.send(await removeOrgService.removeOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})