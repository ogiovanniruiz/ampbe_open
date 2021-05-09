const Router = require('express').Router

const getBlockgroupsService = require('../../../services/geometry/getBlockgroups')

module.exports = Router({ mergeParams: true }).post('/getBlockgroups', async (req, res, next) => {
    try {
        res.send(await getBlockgroupsService.getBlockgroups(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
