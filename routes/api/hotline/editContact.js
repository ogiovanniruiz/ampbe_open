const Router = require('express').Router

const editContactService = require('../../../services/hotline/editContact')

module.exports = Router({ mergeParams: true }).post('/editContact', async (req, res, next) => {
    try {
        res.send(await editContactService.editContact(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})