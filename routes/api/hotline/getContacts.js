const Router = require('express').Router

const getContactsService = require('../../../services/hotline/getContacts')

module.exports = Router({ mergeParams: true }).post('/getContacts', async (req, res, next) => {
    try {
        res.send(await getContactsService.getContacts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})