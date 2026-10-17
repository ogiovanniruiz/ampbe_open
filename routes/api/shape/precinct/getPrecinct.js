const Router = require('express').Router

const getPrecinctService = require('../../../../services/shape/precinct/getPrecinct')

module.exports = Router({ mergeParams: true }).post('/getPrecinct', async (req, res, next) => {
    try {
        res.send(await getPrecinctService.getPrecinct(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
