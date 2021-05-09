const Router = require('express').Router

const getOrgUsersService = require('../../../services/organization/getOrgUsers')

module.exports = Router({ mergeParams: true }).post('/getOrgUsers', async (req, res, next) => {
    try {
        res.send(await getOrgUsersService.getOrgUsers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})