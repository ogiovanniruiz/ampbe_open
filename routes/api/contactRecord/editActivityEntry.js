const Router = require('express').Router

const editActivityEntryService = require('../../../services/contactRecord/editActivityEntry')

module.exports = Router({ mergeParams: true }).post('/editActivityEntry', async (req, res, next) => {
    try {
        res.send(await editActivityEntryService.editActivityEntry(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
