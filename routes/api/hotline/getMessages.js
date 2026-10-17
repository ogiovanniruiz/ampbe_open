const Router = require('express').Router

const getMessagesService = require('../../../services/hotline/getMessages')

module.exports = Router({ mergeParams: true }).post('/getMessages', async (req, res, next) => {
    try {
        res.send(await getMessagesService.getMessages(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})