const Router = require('express').Router

const submitPhoneScriptResponseService = require('../../../services/phonebank/submitPhoneScriptResponse')

module.exports = Router({ mergeParams: true }).post('/submitPhoneScriptResponse', async (req, res, next) => {
    try {
        res.send(await submitPhoneScriptResponseService.submitPhoneScriptResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})