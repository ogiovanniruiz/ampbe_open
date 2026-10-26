const Router = require('express').Router

const createTextingTemplateService = require('../../../../services/texting/textingTemplates/createTextingTemplate')

module.exports = Router({ mergeParams: true }).post('/createTextingTemplate', async (req, res, next) => {
    try {
        res.send(await createTextingTemplateService.createTextingTemplate(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})