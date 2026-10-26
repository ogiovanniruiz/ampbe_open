const Router = require('express').Router

const deleteGroupService = require('../../../services/group/deleteGroup')

module.exports = Router({ mergeParams: true }).post('/deleteGroup', async (req, res, next) => {
    try {
        res.send(await deleteGroupService.deleteGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})