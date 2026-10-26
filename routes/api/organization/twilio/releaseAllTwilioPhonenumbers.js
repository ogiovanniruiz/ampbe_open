const Router = require('express').Router

const releaseAllTwilioPhonenumbersService = require('../../../../services/organization/twilio/releaseAllTwilioPhonenumbers')

module.exports = Router({ mergeParams: true }).post('/releaseAllTwilioPhonenumbers', async (req, res, next) => {
    try {
        res.send(await releaseAllTwilioPhonenumbersService.releaseAllTwilioPhonenumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})