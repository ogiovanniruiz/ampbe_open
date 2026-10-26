const Router = require('express').Router

const getClientConfigService = require('../../../services/config/getClientConfig')

module.exports = Router({ mergeParams: true }).post('/getClientConfig', async (req, res, next) => {
    try {
        res.send(await getClientConfigService.getClientConfig())
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
