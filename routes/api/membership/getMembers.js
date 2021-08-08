const Router = require('express').Router

const getMembersService = require('../../../services/membership/getMembers')

module.exports = Router({ mergeParams: true }).post('/getMembers', async (req, res, next) => {
    try {
        res.send(await getMembersService.getMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})