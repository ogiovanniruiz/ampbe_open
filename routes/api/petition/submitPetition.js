const Router = require('express').Router

const submitPetitionService = require('../../../services/petition/submitPetition')

module.exports = Router({ mergeParams: true }).post('/submitPetition', async (req, res, next) => {
    try {
        res.send(await submitPetitionService.submitPetition(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})