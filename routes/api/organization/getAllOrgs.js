const Router = require('express').Router

const getAllOrgsService = require('../../../services/organization/getAllOrgs')

module.exports = Router({ mergeParams: true }).post('/getAllOrgs', async (req, res, next) => {
    try {
        res.send(await getAllOrgsService.getAllOrgs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})