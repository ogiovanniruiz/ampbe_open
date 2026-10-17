const Router = require('express').Router

const bulkUpdateMembersService = require('../../../services/membership/bulkUpdateMembers')

module.exports = Router({ mergeParams: true }).post('/bulkUpdateMembers', async (req, res, next) => {
    try {
        res.send(await bulkUpdateMembersService.bulkUpdateMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
