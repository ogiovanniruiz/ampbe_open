const Router = require('express').Router

const getDispatchersService = require('../../../services/hotline/getDispatchers')

module.exports = Router({ mergeParams: true }).post('/getDispatchers', async (req, res, next) => {
    try {
        res.send(await getDispatchersService.getDispatchers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})