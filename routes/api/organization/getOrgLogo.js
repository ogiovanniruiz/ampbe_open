const Router = require('express').Router

const getOrgLogoService = require('../../../services/organization/getOrgLogo')

module.exports = Router({ mergeParams: true }).post('/getOrgLogo', async (req, res, next) => {
    try {
        res.send(await getOrgLogoService.getOrgLogo(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})