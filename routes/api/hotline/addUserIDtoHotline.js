const Router = require('express').Router

const addUserIDtoHotlineService = require('../../../services/hotline/addUserIDtoHotline')

module.exports = Router({ mergeParams: true }).post('/addUserIDtoHotline', async (req, res, next) => {
    try {
        res.send(await addUserIDtoHotlineService.addUserIDtoHotline(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})