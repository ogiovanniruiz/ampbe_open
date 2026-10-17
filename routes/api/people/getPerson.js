const Router = require('express').Router

const getPersonService = require('../../../services/people/getPerson')

module.exports = Router({ mergeParams: true }).post('/getPerson', async (req, res, next) => {
    try {
        res.send(await getPersonService.getPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})