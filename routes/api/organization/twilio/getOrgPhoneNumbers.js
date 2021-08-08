const Router = require('express').Router

const getOrgPhoneNumbersService = require('../../../../services/organization/twilio/getOrgPhoneNumbers')

module.exports = Router({ mergeParams: true }).post('/getOrgPhoneNumbers', async (req, res, next) => {
    try {
        res.send(await getOrgPhoneNumbersService.getOrgPhoneNumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})