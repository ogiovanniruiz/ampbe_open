const Router = require('express').Router

const getAllOrgsByIDsService = require('../../../services/organization/getAllOrgsByIDs')

module.exports = Router({ mergeParams: true }).post('/getAllOrgsByIDs', async (req, res, next) => {
    try {
        res.send(await getAllOrgsByIDsService.getAllOrgsByIDs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
