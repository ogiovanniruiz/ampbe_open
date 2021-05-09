const Router = require('express').Router

const downloadOrgContactHistoryService = require('../../../services/organization/downloadOrgContactHistory')

module.exports = Router({ mergeParams: true }).post('/downloadOrgContactHistory', async (req, res, next) => {
    try {
        res.send(await downloadOrgContactHistoryService.downloadOrgContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})