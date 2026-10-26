const Router = require('express').Router

const updateTagDefinitionService = require('../../../../services/organization/tags/updateTagDefinition')

module.exports = Router({ mergeParams: true }).post('/updateTagDefinition', async (req, res, next) => {
    try {
        res.send(await updateTagDefinitionService.updateTagDefinition(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
