const Router = require('express').Router

const saveCallNotesService = require('../../../services/hotline/saveCallNotes')

module.exports = Router({ mergeParams: true }).post('/saveCallNotes', async (req, res, next) => {
    try {
        res.send(await saveCallNotesService.saveCallNotes(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})