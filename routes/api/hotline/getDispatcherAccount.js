const Router = require('express').Router

const getDispatcherAccountService = require('../../../services/hotline/getDispatcherAccount')

module.exports = Router({ mergeParams: true }).post('/getDispatcherAccount', async (req, res, next) => {
    try {
        res.send(await getDispatcherAccountService.getDispatcherAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})