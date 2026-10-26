const Router = require('express').Router

const createCanvassContactRecordService = require('../../../services/canvass/createCanvassContactRecord')

module.exports = Router({ mergeParams: true }).post('/createCanvassContactRecord', async (req, res, next) => {
    try {
        res.send(await createCanvassContactRecordService.createCanvassContactRecord(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})