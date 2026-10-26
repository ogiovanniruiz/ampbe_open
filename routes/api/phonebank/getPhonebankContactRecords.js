const Router = require('express').Router

const getPhonebankContactRecordsService = require('../../../services/phonebank/getPhonebankContactRecords')

module.exports = Router({ mergeParams: true }).post('/getPhonebankContactRecords', async (req, res, next) => {
    try {
        res.send(await getPhonebankContactRecordsService.getPhonebankContactRecords(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})