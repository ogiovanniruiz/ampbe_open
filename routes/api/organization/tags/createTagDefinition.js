const Router = require('express').Router

const createTagDefinitionService = require('../../../../services/organization/tags/createTagDefinition')

module.exports = Router({ mergeParams: true }).post('/createTagDefinition', async (req, res, next) => {
    try {
        res.send(await createTagDefinitionService.createTagDefinition(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
