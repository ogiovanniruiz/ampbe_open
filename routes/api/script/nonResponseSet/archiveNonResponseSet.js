const Router = require('express').Router

const archiveNonResponseSetService = require('../../../../services/script/nonResponseSet/archiveNonResponseSet')

module.exports = Router({ mergeParams: true }).post('/archiveNonResponseSet', async (req, res, next) => {
    try {
        res.send(await archiveNonResponseSetService.archiveNonResponseSet(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})