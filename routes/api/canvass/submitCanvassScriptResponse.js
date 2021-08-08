const Router = require('express').Router

const submitCanvassScriptResponseService = require('../../../services/canvass/submitCanvassScriptResponse')

module.exports = Router({ mergeParams: true }).post('/submitCanvassScriptResponse', async (req, res, next) => {
    try {
        res.send(await submitCanvassScriptResponseService.submitCanvassScriptResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})