const Router = require('express').Router

const getOrgTargetsService = require('../../../services/target/getOrgTargets')

module.exports = Router({ mergeParams: true }).post('/getOrgTargets', async (req, res, next) => {
    try {
        res.send(await getOrgTargetsService.getOrgTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})