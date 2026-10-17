const Router = require('express').Router

const getCanvassBuildingRecordsService = require('../../../services/canvass/getCanvassBuildingRecords')

module.exports = Router({ mergeParams: true }).post('/getCanvassBuildingRecords', async (req, res, next) => {
    try {
        res.send(await getCanvassBuildingRecordsService.getCanvassBuildingRecords(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})