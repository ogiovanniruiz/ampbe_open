
const Router = require('express').Router

const getPetitionsService = require('../../../services/petition/getPetitions')

module.exports = Router({ mergeParams: true }).post('/getPetitions', async (req, res, next) => {
    try {
        res.send(await getPetitionsService.getPetitions(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})