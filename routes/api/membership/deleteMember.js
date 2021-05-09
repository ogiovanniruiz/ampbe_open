const Router = require('express').Router

const deleteMemberService = require('../../../services/membership/deleteMember')

module.exports = Router({ mergeParams: true }).post('/deleteMember', async (req, res, next) => {
    try {
        res.send(await deleteMemberService.deleteMember(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})