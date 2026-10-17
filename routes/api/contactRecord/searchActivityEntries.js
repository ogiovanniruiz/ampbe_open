const Router = require('express').Router

const searchActivityEntriesService = require('../../../services/contactRecord/searchActivityEntries')

module.exports = Router({ mergeParams: true }).post('/searchActivityEntries', async (req, res, next) => {
    try {
        res.send(await searchActivityEntriesService.searchActivityEntries(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
