const Router = require('express').Router

const getPhonebankNotesService = require('../../../services/phonebank/getPhonebankNotes')

module.exports = Router({ mergeParams: true }).post('/getPhonebankNotes', async (req, res, next) => {
    try {
        res.send(await getPhonebankNotesService.getPhonebankNotes(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})