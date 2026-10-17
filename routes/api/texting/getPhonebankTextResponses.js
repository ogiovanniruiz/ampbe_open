
const Router = require('express').Router

const getPhonebankTextResponsesService = require('../../../services/texting/getPhonebankTextResponses')

module.exports = Router({ mergeParams: true }).post('/getPhonebankTextResponses', async (req, res, next) => {
    try {
        res.send(await getPhonebankTextResponsesService.getPhonebankTextResponses(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})