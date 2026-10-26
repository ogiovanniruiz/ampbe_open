const Router = require('express').Router

const getOrgUserRequestsService = require('../../../services/organization/getOrgUserRequests')

module.exports = Router({ mergeParams: true }).post('/getOrgUserRequests', async (req, res, next) => {
    try {
        res.send(await getOrgUserRequestsService.getOrgUserRequests(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})