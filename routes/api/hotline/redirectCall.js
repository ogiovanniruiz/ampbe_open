const Router = require('express').Router

const redirectCallService = require('../../../services/hotline/redirectCall')

module.exports = Router({ mergeParams: true }).post('/redirectCall', async (req, res, next) => {
    try {
        res.send(await redirectCallService.redirectCall(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})