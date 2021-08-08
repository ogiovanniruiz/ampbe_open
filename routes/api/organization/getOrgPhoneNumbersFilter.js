const Router = require('express').Router

const getOrgPhoneNumbersFilterService = require('../../../services/organization/getOrgPhoneNumbersFilter')

module.exports = Router({ mergeParams: true }).post('/getOrgPhoneNumbersFilter', async (req, res, next) => {
    try {
        res.send(await getOrgPhoneNumbersFilterService.getOrgPhoneNumbersFilter(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
