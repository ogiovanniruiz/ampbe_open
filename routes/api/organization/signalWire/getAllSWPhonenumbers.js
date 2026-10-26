const Router = require('express').Router

const getAllSWPhonenumbersService = require('../../../../services/organization/signalWire/getAllSWPhonenumbers')

module.exports = Router({ mergeParams: true }).post('/getAllSWPhonenumbers', async (req, res, next) => {
    try {
        res.send(await getAllSWPhonenumbersService.getAllSWPhonenumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})