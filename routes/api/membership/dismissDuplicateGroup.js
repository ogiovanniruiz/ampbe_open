const Router = require('express').Router

const dismissDuplicateGroupService = require('../../../services/membership/dismissDuplicateGroup')

module.exports = Router({ mergeParams: true }).post('/dismissDuplicateGroup', async (req, res, next) => {
    try {
        res.send(await dismissDuplicateGroupService.dismissDuplicateGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
