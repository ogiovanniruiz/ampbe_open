const Router = require('express').Router

const getCanvassHouseHoldRecordService = require('../../../services/canvass/getCanvassHouseHoldRecord')

module.exports = Router({ mergeParams: true }).post('/getCanvassHouseHoldRecord', async (req, res, next) => {
    try {
        res.send(await getCanvassHouseHoldRecordService.getCanvassHouseHoldRecord(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})