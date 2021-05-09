const Router = require('express').Router

const createTagService = require('../../../../services/organization/tags/createTag')

module.exports = Router({ mergeParams: true }).post('/createTag', async (req, res, next) => {
    try {
        res.send(await createTagService.createTag(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})