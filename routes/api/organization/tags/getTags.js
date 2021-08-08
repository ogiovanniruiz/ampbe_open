const Router = require('express').Router

const getTagsService = require('../../../../services/organization/tags/getTags')

module.exports = Router({ mergeParams: true }).post('/getTags', async (req, res, next) => {
    try {
        res.send(await getTagsService.getTags(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})