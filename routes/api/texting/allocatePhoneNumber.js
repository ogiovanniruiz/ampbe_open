const Router = require('express').Router

const allocatePhoneNumberService = require('../../../services/texting/allocatePhoneNumber')

module.exports = Router({ mergeParams: true }).post('/allocatePhoneNumber', async (req, res, next) => {
    try {
        res.send(await allocatePhoneNumberService.allocatePhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})