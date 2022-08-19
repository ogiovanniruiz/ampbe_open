const Router = require('express').Router

const downloadNotesService = require('../../../services/outreachReports/downloadNotes')

module.exports = Router({ mergeParams: true }).post('/downloadNotes', async (req, res, next) => {
    try {
        res.send(await downloadNotesService.downloadNotes(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})