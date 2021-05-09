const Router = require('express').Router

const submitAgreementService = require('../../../services/user/submitAgreement')

module.exports = Router({ mergeParams: true }).post('/submitAgreement', async (req, res, next) => {
    try {
        res.send(await submitAgreementService.submitAgreement(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})