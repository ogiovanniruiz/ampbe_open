const Router = require('express').Router

const mergeMembersService = require('../../../services/membership/mergeMembers')

module.exports = Router({ mergeParams: true }).post('/mergeMembers', async (req, res, next) => {
    try {
        res.send(await mergeMembersService.mergeMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
