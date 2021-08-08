const Router = require('express').Router

const createNonResponseSetService = require('../../../../services/script/nonResponseSet/createNonResponseSet')

module.exports = Router({ mergeParams: true }).post('/createNonResponseSet', async (req, res, next) => {
    try {
        res.send(await createNonResponseSetService.createNonResponseSet(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})