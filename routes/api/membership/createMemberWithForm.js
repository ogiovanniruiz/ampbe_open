const Router = require('express').Router

const createMemberWithFormService = require('../../../services/membership/createMember/createMemberWithForm')

module.exports = Router({ mergeParams: true }).post('/createMemberWithForm', async (req, res, next) => {
    try {
        res.send(await createMemberWithFormService.createMemberWithForm(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})