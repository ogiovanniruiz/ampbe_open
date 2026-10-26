const Router = require('express').Router

const createMemberWithVoterService = require('../../../services/membership/createMember/createMemberWithVoter')

module.exports = Router({ mergeParams: true }).post('/createMemberWithVoter', async (req, res, next) => {
    try {
        res.send(await createMemberWithVoterService.createMemberWithVoter(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})