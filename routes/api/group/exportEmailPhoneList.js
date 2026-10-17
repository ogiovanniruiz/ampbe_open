const Router = require('express').Router

const exportEmailPhoneListService = require('../../../services/group/exportEmailPhoneList')

module.exports = Router({ mergeParams: true }).post('/exportEmailPhoneList', async (req, res, next) => {
    try {
        res.send(await exportEmailPhoneListService.exportEmailPhoneList(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})