const Router = require('express').Router

const updateActivityNotesService = require('../../../services/activity/updateActivityNotes')

module.exports = Router({ mergeParams: true }).post('/updateActivityNotes', async (req, res, next) => {
    try {
        res.send(await updateActivityNotesService.updateActivityNotes(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})