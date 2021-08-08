const Router = require('express').Router

const getOrgPermissionsService = require('../../../services/organization/getOrgPermissions')

module.exports = Router({ mergeParams: true }).post('/getOrgPermissions', async (req, res, next) => {
    try {
        res.send(await getOrgPermissionsService.getOrgPermissions(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})