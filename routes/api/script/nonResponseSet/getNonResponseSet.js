const Router = require('express').Router

const getNonResponseSetService = require('../../../../services/script/nonResponseSet/getNonResponseSet')

module.exports = Router({ mergeParams: true }).post('/getNonResponseSet', async (req, res, next) => {
    try {
        res.send(await getNonResponseSetService.getNonResponseSet(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})