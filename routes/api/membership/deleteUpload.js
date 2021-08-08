const Router = require('express').Router

const deleteUploadService = require('../../../services/membership/deleteUpload')

module.exports = Router({ mergeParams: true }).post('/deleteUpload', async (req, res, next) => {
    try {
        res.send(await deleteUploadService.deleteUpload(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})