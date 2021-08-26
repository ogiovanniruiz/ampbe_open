const Router = require('express').Router

const getOrgCOIsService = require('../../../services/asset/getOrgCOIs')

module.exports = Router({ mergeParams: true }).post('/getOrgCOIs', async (req, res, next) => {
    try {
        res.send(await getOrgCOIsService.getOrgCOIs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})