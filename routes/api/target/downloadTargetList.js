const Router = require('express').Router

const downloadTargetListService = require('../../../services/target/downloadTargetList')

module.exports = Router({ mergeParams: true }).post('/downloadTargetList', async (req, res, next) => {
    try {
        res.send(await downloadTargetListService.downloadTargetList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})