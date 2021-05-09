const Router = require('express').Router

const getPolysService = require('../../../services/geometry/getPolys')

module.exports = Router({ mergeParams: true }).post('/getPolys', async (req, res, next) => {
    try {
        res.send(await getPolysService.getPolys(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})