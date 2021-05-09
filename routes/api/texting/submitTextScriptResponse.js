const Router = require('express').Router

const submitTextScriptResponseService = require('../../../services/texting/submitTextScriptResponse')

module.exports = Router({ mergeParams: true }).post('/submitTextScriptResponse', async (req, res, next) => {
    try {
        res.send(await submitTextScriptResponseService.submitTextScriptResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})