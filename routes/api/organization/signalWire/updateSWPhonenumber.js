const Router = require('express').Router

const updateSWPhonenumberService = require('../../../../services/organization/signalWire/updateSWPhonenumber')

module.exports = Router({ mergeParams: true }).post('/updateSWPhonenumber', async (req, res, next) => {
    try {
        res.send(await updateSWPhonenumberService.updateSWPhonenumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})