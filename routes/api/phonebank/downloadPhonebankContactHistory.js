const Router = require('express').Router

const downloadPhonebankContactHistoryService = require('../../../services/phonebank/downloadPhonebankContactHistory')

module.exports = Router({ mergeParams: true }).post('/downloadPhonebankContactHistory', async (req, res, next) => {
    try {
        res.send(await downloadPhonebankContactHistoryService.downloadPhonebankContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})