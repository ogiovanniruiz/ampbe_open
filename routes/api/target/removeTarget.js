const Router = require('express').Router

const removeTargetService = require('../../../services/target/removeTarget')

module.exports = Router({ mergeParams: true }).post('/removeTarget', async (req, res, next) => {
    try {
        res.send(await removeTargetService.removeTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})