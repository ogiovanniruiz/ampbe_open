const Router = require('express').Router

const getTextbankContactHistoryService = require('../../../services/texting/getTextbankContactHistory')

module.exports = Router({ mergeParams: true }).post('/getTextbankContactHistory', async (req, res, next) => {
    try {
        res.send(await getTextbankContactHistoryService.getTextbankContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})