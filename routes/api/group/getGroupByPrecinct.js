const Router = require('express').Router

const getGroupByPrecinctService = require('../../../services/group/getGroupByPrecinct')

module.exports = Router({ mergeParams: true }).post('/getGroupByPrecinct', async (req, res, next) => {
    try {
        res.send(await getGroupByPrecinctService.getGroupByPrecinct(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})