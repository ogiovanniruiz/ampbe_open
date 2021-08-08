const Router = require('express').Router

const downloadTargetService = require('../../../services/target/downloadTarget')

module.exports = Router({ mergeParams: true }).post('/downloadTarget', async (req, res, next) => {
    try {
        res.send(await downloadTargetService.downloadTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})