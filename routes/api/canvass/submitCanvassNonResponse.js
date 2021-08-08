const Router = require('express').Router

const submitCanvassNonResponseService = require('../../../services/canvass/submitCanvassNonResponse')

module.exports = Router({ mergeParams: true }).post('/submitCanvassNonResponse', async (req, res, next) => {
    try {
        res.send(await submitCanvassNonResponseService.submitCanvassNonResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})