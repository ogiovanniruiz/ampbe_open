const Router = require('express').Router

const getGroupService = require('../../../services/group/getGroup')

module.exports = Router({ mergeParams: true }).post('/getGroup', async (req, res, next) => {
    try {
        res.send(await getGroupService.getGroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})