const Router = require('express').Router

const saveActivityEditsService = require('../../../services/activity/saveActivityEdits')

module.exports = Router({ mergeParams: true }).post('/saveActivityEdits', async (req, res, next) => {
    try {
        res.send(await saveActivityEditsService.saveActivityEdits(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})