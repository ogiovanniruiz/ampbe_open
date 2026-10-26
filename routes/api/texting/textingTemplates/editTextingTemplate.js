const Router = require('express').Router

const editTextingTemplateService = require('../../../../services/texting/textingTemplates/editTextingTemplate')

module.exports = Router({ mergeParams: true }).post('/editTextingTemplate', async (req, res, next) => {
    try {
        res.send(await editTextingTemplateService.editTextingTemplate(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})