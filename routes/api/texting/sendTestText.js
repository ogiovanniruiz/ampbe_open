const Router = require('express').Router

const sendTestTextService = require('../../../services/texting/sendTestText')

module.exports = Router({ mergeParams: true }).post('/sendTestText', async (req, res, next) => {
    try {
        res.send(await sendTestTextService.sendTestText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})