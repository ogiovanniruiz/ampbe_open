const Router = require('express').Router

const getAllNonResponseSetsService = require('../../../../services/script/nonResponseSet/getAllNonResponseSets')

module.exports = Router({ mergeParams: true }).post('/getAllNonResponseSets', async (req, res, next) => {
    try {
        res.send(await getAllNonResponseSetsService.getAllNonResponseSets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})