const Router = require('express').Router

const getCanvassContactHistoryService = require('../../../services/canvass/getCanvassContactHistory')

module.exports = Router({ mergeParams: true }).post('/getCanvassContactHistory', async (req, res, next) => {
    try {
        res.send(await getCanvassContactHistoryService.getCanvassContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})