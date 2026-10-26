const Router = require('express').Router

const editUploadService = require('../../../services/membership/editUpload')

module.exports = Router({ mergeParams: true }).post('/editUpload', async (req, res, next) => {
    try {
        res.send(await editUploadService.editUpload(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})