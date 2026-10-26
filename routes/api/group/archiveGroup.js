const Router = require('express').Router

const archiveGroupService = require('../../../services/group/archiveGroup')

module.exports = Router({ mergeParams: true }).post('/archiveGroup', async (req, res, next) => {
    try {
        res.send(await archiveGroupService.archiveGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})