const Router = require('express').Router

const createTargetService = require('../../../services/target/createTarget')

module.exports = Router({ mergeParams: true }).post('/createTarget', async (req, res, next) => {
    try {
        res.send(await createTargetService.createTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})