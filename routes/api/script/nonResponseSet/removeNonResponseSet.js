const Router = require('express').Router

const removeNonResponseSetService = require('../../../../services/script/nonResponseSet/removeNonResponseSet')

module.exports = Router({ mergeParams: true }).post('/removeNonResponseSet', async (req, res, next) => {
    try {
        res.send(await removeNonResponseSetService.removeNonResponseSet(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})