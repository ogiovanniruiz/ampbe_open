const Router = require('express').Router

const deleteTagService = require('../../../../services/organization/tags/deleteTag')

module.exports = Router({ mergeParams: true }).post('/deleteTag', async (req, res, next) => {
    try {
        res.send(await deleteTagService.deleteTag(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})