const Router = require('express').Router

const submitHotlineResponseService = require('../../../services/hotline/submitHotlineResponse')

module.exports = Router({ mergeParams: true }).post('/submitHotlineResponse', async (req, res, next) => {
    try {
        res.send(await submitHotlineResponseService.submitHotlineResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})