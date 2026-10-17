const Router = require('express').Router

const enableHotlinePhonenumberService = require('../../../services/hotline/enableHotlinePhonenumber')

module.exports = Router({ mergeParams: true }).post('/enableHotlinePhonenumber', async (req, res, next) => {
    try {
        res.send(await enableHotlinePhonenumberService.enableHotlinePhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})