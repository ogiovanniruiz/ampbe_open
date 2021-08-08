const Router = require('express').Router

const getAllScriptsService = require('../../../services/script/getAllScripts')

module.exports = Router({ mergeParams: true }).post('/getAllScripts', async (req, res, next) => {
    try {
        res.send(await getAllScriptsService.getAllScripts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})