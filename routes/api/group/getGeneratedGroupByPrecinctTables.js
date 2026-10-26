const Router = require('express').Router

const getGeneratedGroupByPrecinctTablesService = require('../../../services/group/getGeneratedGroupByPrecinctTables')

module.exports = Router({ mergeParams: true }).post('/getGeneratedGroupByPrecinctTables', async (req, res, next) => {
    try {
        res.send(await getGeneratedGroupByPrecinctTablesService.getGeneratedGroupByPrecinctTables(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})