const Router = require('express').Router

const createContactService = require('../../../services/hotline/createContact')

module.exports = Router({ mergeParams: true }).post('/createContact', async (req, res, next) => {
    try {
        res.send(await createContactService.createContact(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})