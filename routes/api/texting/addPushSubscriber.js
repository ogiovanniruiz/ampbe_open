const Router = require('express').Router

const addPushSubscriberService = require('../../../services/texting/addPushSubscriber')

module.exports = Router({ mergeParams: true }).post('/addPushSubscriber', async (req, res, next) => {
    try {
        res.send(await addPushSubscriberService.addPushSubscriber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})