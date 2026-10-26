
const Router = require('express').Router

const getAvailableTextingNumbersService = require('../../../services/texting/getAvailableTextingNumbers')

module.exports = Router({ mergeParams: true }).post('/getAvailableTextingNumbers', async (req, res, next) => {
    try {
        res.send(await getAvailableTextingNumbersService.getAvailableTextingNumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})