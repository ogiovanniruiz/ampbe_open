const Router = require('express').Router

const editOrgService = require('../../../services/organization/editOrg')

module.exports = Router({ mergeParams: true }).post('/editOrg', async (req, res, next) => {
    try {
        res.send(await editOrgService.editOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})