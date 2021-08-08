const Router = require('express').Router

const downloadHotlineContactHistoryService = require('../../../services/hotline/downloadHotlineContactHistory')

module.exports = Router({ mergeParams: true }).post('/downloadHotlineContactHistory', async (req, res, next) => {
    try {
        res.send(await downloadHotlineContactHistoryService.downloadHotlineContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})