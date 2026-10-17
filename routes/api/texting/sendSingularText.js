const Router = require('express').Router

const sendSingularTextService = require('../../../services/texting/sendSingularText')

module.exports = Router({ mergeParams: true }).post('/sendSingularText', async (req, res, next) => {
    try {
        res.send(await sendSingularTextService.sendSingularText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})