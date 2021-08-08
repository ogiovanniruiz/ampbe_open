const Router = require('express').Router

const archiveScriptService = require('../../../services/script/archiveScript')

module.exports = Router({ mergeParams: true }).post('/archiveScript', async (req, res, next) => {
    try {
        res.send(await archiveScriptService.archiveScript(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})