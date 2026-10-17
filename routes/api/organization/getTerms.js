const Router = require('express').Router

const getTermsService = require('../../../services/organization/getTerms')

module.exports = Router({ mergeParams: true }).post('/getTerms', async (req, res, next) => {
    try {
        res.send(await getTermsService.getTerms())
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
