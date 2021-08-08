const Router = require('express').Router

const getTargetService = require('../../../services/target/getTarget')

module.exports = Router({ mergeParams: true }).post('/getTarget', async (req, res, next) => {
    try {
        res.send(await getTargetService.getTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})