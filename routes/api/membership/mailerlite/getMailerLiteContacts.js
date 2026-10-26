const Router = require('express').Router

const getMailerLiteContactsService = require('../../../../services/membership/mailerlite/getMailerLiteContacts')

module.exports = Router({ mergeParams: true }).post('/getMailerLiteContacts', async (req, res, next) => {
    try {
        res.send(await getMailerLiteContactsService.getMailerLiteContacts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})