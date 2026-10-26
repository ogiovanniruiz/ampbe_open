const Router = require('express').Router

const downloadMailerService = require('../../../services/group/downloadMailer')

module.exports = Router({ mergeParams: true }).post('/downloadMailer', async (req, res, next) => {
    try {
        res.send(await downloadMailerService.downloadMailer(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})