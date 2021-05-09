const Router = require('express').Router

const getScriptService = require('../../../services/script/getScript')

module.exports = Router({ mergeParams: true }).post('/getScript', async (req, res, next) => {
    try {
        res.send(await getScriptService.getScript(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})