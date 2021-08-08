const Router = require('express').Router

const submitPhoneNonResponseService = require('../../../services/phonebank/submitPhoneNonResponse')

module.exports = Router({ mergeParams: true }).post('/submitPhoneNonResponse', async (req, res, next) => {
    try {
        res.send(await submitPhoneNonResponseService.submitPhoneNonResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})