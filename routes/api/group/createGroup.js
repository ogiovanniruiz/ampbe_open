const Router = require('express').Router

const createGroupService = require('../../../services/group/createGroup')

module.exports = Router({ mergeParams: true }).post('/createGroup', async (req, res, next) => {
    try {
        res.send(await createGroupService.createGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})