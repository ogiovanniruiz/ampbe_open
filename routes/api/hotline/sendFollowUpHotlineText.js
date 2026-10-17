const Router = require('express').Router

const sendFollowUpHotlineTextService = require('../../../services/hotline/sendFollowUpHotlineText')

module.exports = Router({ mergeParams: true }).post('/sendFollowUpHotlineText', async (req, res, next) => {
    try {
        res.send(await sendFollowUpHotlineTextService.sendFollowUpHotlineText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})