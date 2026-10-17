const Router = require('express').Router

const createHotlineRecordingService = require('../../../services/hotline/createHotlineRecording')

module.exports = Router({ mergeParams: true }).post('/createHotlineRecording', async (req, res, next) => {
    try {
        res.send(await createHotlineRecordingService.createHotlineRecording(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})