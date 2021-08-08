const Router = require('express').Router

const removeScriptService = require('../../../services/script/removeScript')

module.exports = Router({ mergeParams: true }).post('/removeScript', async (req, res, next) => {
    try {
        res.send(await removeScriptService.removeScript(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})