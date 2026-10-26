const Router = require('express').Router

const removeContactService = require('../../../services/hotline/removeContact')

module.exports = Router({ mergeParams: true }).post('/removeContact', async (req, res, next) => {
    try {
        res.send(await removeContactService.removeContact(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})