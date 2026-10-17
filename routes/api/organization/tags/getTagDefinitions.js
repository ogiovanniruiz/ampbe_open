const Router = require('express').Router

const getTagDefinitionsService = require('../../../../services/organization/tags/getTagDefinitions')

module.exports = Router({ mergeParams: true }).post('/getTagDefinitions', async (req, res, next) => {
    try {
        res.send(await getTagDefinitionsService.getTagDefinitions(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
