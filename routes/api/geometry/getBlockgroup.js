const Router = require('express').Router

const getBlockgroupService = require('../../../services/geometry/getBlockgroup')

module.exports = Router({ mergeParams: true }).post('/getBlockgroup', async (req, res, next) => {
    try {
        res.send(await getBlockgroupService.getBlockgroup(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
