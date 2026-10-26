const Router = require('express').Router

const updateAgreementService = require('../../../services/organization/updateAgreement')

module.exports = Router({ mergeParams: true }).post('/updateAgreement', async (req, res, next) => {
    try {
        res.send(await updateAgreementService.updateAgreement(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})