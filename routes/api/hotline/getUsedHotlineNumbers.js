const Router = require('express').Router

const getUsedHotlineNumbersService = require('../../../services/hotline/getUsedHotlineNumbers')

module.exports = Router({ mergeParams: true }).post('/getUsedHotlineNumbers', async (req, res, next) => {
    try {
        res.send(await getUsedHotlineNumbersService.getUsedHotlineNumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})