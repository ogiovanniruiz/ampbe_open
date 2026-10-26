const Router = require('express').Router

const getRegistrationPrecinctsService = require('../../../services/amp/getRegistrationPrecincts')

module.exports = Router({ mergeParams: true }).post('/getRegistrationPrecincts', async (req, res, next) => {
    try {
        res.send(await getRegistrationPrecinctsService.getRegistrationPrecincts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})