const Router = require('express').Router

const getHotlineRecordingService = require('../../../services/hotline/getHotlineRecording')

module.exports = Router({ mergeParams: true }).post('/getHotlineRecording', async (req, res, next) => {
    try {
        res.send(await getHotlineRecordingService.getHotlineRecording(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})