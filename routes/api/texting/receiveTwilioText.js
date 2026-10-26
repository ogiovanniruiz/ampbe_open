const Router = require('express').Router

const receiveTwilioTextService = require('../../../services/texting/receiveTwilioText')

module.exports = Router({ mergeParams: true }).post('/receiveTwilioText', async (req, res, next) => {
    try {
        res.send(await receiveTwilioTextService.receiveTwilioText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})