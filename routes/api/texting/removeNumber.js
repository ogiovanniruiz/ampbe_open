const Router = require('express').Router

const removeNumberService = require('../../../services/texting/removeNumber')

module.exports = Router({ mergeParams: true }).post('/removeNumber', async (req, res, next) => {
    try {
        res.send(await removeNumberService.removeNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})