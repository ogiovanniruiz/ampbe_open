const Router = require('express').Router

const getOrgTermsStatusService = require('../../../services/organization/getOrgTermsStatus')

module.exports = Router({ mergeParams: true }).post('/getOrgTermsStatus', async (req, res, next) => {
    try {
        res.send(await getOrgTermsStatusService.getOrgTermsStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
