const Router = require('express').Router

const sendFollowUpTextService = require('../../../services/texting/sendFollowUpText')

module.exports = Router({ mergeParams: true }).post('/sendFollowUpText', async (req, res, next) => {
    try {
        res.send(await sendFollowUpTextService.sendFollowUpText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})