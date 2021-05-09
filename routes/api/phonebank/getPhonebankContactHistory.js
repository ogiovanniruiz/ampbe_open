const Router = require('express').Router

const getPhonebankContactHistoryService = require('../../../services/phonebank/getPhonebankContactHistory')

module.exports = Router({ mergeParams: true }).post('/getPhonebankContactHistory', async (req, res, next) => {
    try {
        res.send(await getPhonebankContactHistoryService.getPhonebankContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})