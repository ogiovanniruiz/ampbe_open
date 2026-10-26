const Router = require('express').Router

const editCanvassContactRecordService = require('../../../services/canvass/editCanvassContactRecord')

module.exports = Router({ mergeParams: true }).post('/editCanvassContactRecord', async (req, res, next) => {
    try {
        res.send(await editCanvassContactRecordService.editCanvassContactRecord(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})