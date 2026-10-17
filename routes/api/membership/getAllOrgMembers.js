const Router = require('express').Router

const getAllOrgMembersService = require('../../../services/membership/getAllOrgMembers')

module.exports = Router({ mergeParams: true }).post('/getAllOrgMembers', async (req, res, next) => {
    try {
        res.send(await getAllOrgMembersService.getAllOrgMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})