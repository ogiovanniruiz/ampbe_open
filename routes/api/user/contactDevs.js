const Router = require('express').Router

const contactDevsService = require('../../../services/user/contactDevs')

module.exports = Router({ mergeParams: true }).post('/contactDevs', async (req, res, next) => {
    try {
        res.send(await contactDevsService.contactDevs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})