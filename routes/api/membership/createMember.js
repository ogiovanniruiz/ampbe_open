const Router = require('express').Router

const createMemberService = require('../../../services/membership/createMember')

module.exports = Router({ mergeParams: true }).post('/createMember', async (req, res, next) => {
    try {
        res.send(await createMemberService.createMember(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})