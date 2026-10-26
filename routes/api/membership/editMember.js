const Router = require('express').Router

const editMemberService = require('../../../services/membership/editMember')

module.exports = Router({ mergeParams: true }).post('/editMember', async (req, res, next) => {
    try {
        res.send(await editMemberService.editMember(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})