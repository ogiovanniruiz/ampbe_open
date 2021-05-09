const Router = require('express').Router

const createScriptService = require('../../../services/script/createScript')

module.exports = Router({ mergeParams: true }).post('/createScript', async (req, res, next) => {
    try {
        res.send(await createScriptService.createScript(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})