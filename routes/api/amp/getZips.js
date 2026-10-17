const Router = require('express').Router

const getZipsService = require('../../../services/amp/getZips')

module.exports = Router({ mergeParams: true }).post('/getZips', async (req, res, next) => {
    try {
        res.send(await getZipsService.getZips(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})