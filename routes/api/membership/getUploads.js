const Router = require('express').Router

const getUploadsService = require('../../../services/membership/getUploads')

module.exports = Router({ mergeParams: true }).post('/getUploads', async (req, res, next) => {
    try {
        res.send(await getUploadsService.getUploads(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})