const Router = require('express').Router

const submitTextNonResponseService = require('../../../services/texting/submitTextNonResponse')

module.exports = Router({ mergeParams: true }).post('/submitTextNonResponse', async (req, res, next) => {
    try {
        res.send(await submitTextNonResponseService.submitTextNonResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})