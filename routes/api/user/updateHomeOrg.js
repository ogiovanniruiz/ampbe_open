const Router = require('express').Router

const updateHomeOrgService = require('../../../services/user/updateHomeOrg')

module.exports = Router({ mergeParams: true }).post('/updateHomeOrg', async (req, res, next) => {
    try {
        res.send(await updateHomeOrgService.updateHomeOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})