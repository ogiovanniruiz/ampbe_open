const Router = require('express').Router

const editScriptService = require('../../../services/script/editScript')

module.exports = Router({ mergeParams: true }).post('/editScript', async (req, res, next) => {
    try {
        res.send(await editScriptService.editScript(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})