const Router = require('express').Router

const getDuplicateMembersService = require('../../../services/membership/getDuplicateMembers')

module.exports = Router({ mergeParams: true }).post('/getDuplicateMembers', async (req, res, next) => {
    try {
        res.send(await getDuplicateMembersService.getDuplicateMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
