const Router = require('express').Router

const getHotlineStatusService = require('../../../services/hotline/getHotlineStatus')

module.exports = Router({ mergeParams: true }).post('/getHotlineStatus', async (req, res, next) => {
    try {
        res.send(await getHotlineStatusService.getHotlineStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})