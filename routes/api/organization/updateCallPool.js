const Router = require('express').Router

const updateCallPoolService = require('../../../services/organization/updateCallPool')

module.exports = Router({ mergeParams: true }).post('/updateCallPool', async (req, res, next) => {
    try {
        res.send(await updateCallPoolService.updateCallPool(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})