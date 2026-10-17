const Router = require('express').Router

const bulkTagMembersService = require('../../../services/membership/bulkTagMembers')

module.exports = Router({ mergeParams: true }).post('/bulkTagMembers', async (req, res, next) => {
    try {
        res.send(await bulkTagMembersService.bulkTagMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
