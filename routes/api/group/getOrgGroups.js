const Router = require('express').Router

const getOrgGroupsService = require('../../../services/group/getOrgGroups')

module.exports = Router({ mergeParams: true }).post('/getOrgGroups', async (req, res, next) => {
    try {
        res.send(await getOrgGroupsService.getOrgGroups(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})