const Router = require('express').Router

const getMemberService = require('../../../services/membership/getMember')

module.exports = Router({ mergeParams: true }).post('/getMember', async (req, res, next) => {
    try {
        res.send(await getMemberService.getMember(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})