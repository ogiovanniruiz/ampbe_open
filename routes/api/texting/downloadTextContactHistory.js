const Router = require('express').Router

const downloadTextContactHistoryService = require('../../../services/texting/downloadTextContactHistory')

module.exports = Router({ mergeParams: true }).post('/downloadTextContactHistory', async (req, res, next) => {
    try {
        res.send(await downloadTextContactHistoryService.downloadTextContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})