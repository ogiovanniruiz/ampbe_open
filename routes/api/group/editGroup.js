const Router = require('express').Router

const editGroupService = require('../../../services/group/editGroup')

module.exports = Router({ mergeParams: true }).post('/editGroup', async (req, res, next) => {
    try {
        res.send(await editGroupService.editGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})