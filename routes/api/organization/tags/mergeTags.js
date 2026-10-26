const Router = require('express').Router

const mergeTagsService = require('../../../../services/organization/tags/mergeTags')

module.exports = Router({ mergeParams: true }).post('/mergeTags', async (req, res, next) => {
    try {
        res.send(await mergeTagsService.mergeTags(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})