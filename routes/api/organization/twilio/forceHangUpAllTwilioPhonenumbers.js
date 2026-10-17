const Router = require('express').Router

const forceHangUpAllTwilioPhonenumbersService = require('../../../../services/organization/twilio/forceHangUpAllTwilioPhonenumbers')

module.exports = Router({ mergeParams: true }).post('/forceHangUpAllTwilioPhonenumbers', async (req, res, next) => {
    try {
        res.send(await forceHangUpAllTwilioPhonenumbersService.forceHangUpAllTwilioPhonenumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
