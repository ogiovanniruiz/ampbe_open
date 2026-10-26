const Router = require('express').Router

const getTextingTemplatesService = require('../../../../services/texting/textingTemplates/getTextingTemplates')

module.exports = Router({ mergeParams: true }).post('/getTextingTemplates', async (req, res, next) => {
    try {
        res.send(await getTextingTemplatesService.getTextingTemplates(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})