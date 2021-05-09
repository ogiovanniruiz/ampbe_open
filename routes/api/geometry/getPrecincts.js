const Router = require('express').Router

const getPrecinctsService = require('../../../services/geometry/getPrecincts')

module.exports = Router({ mergeParams: true }).post('/getPrecincts', async (req, res, next) => {
    try {
        res.send(await getPrecinctsService.getPrecincts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
