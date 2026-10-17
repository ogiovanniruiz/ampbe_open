const Router = require('express').Router

const deleteTextingTemplateService = require('../../../../services/texting/textingTemplates/deleteTextingTemplate')

module.exports = Router({ mergeParams: true }).post('/deleteTextingTemplate', async (req, res, next) => {
    try {
        res.send(await deleteTextingTemplateService.deleteTextingTemplate(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})