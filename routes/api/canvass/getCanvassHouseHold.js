const Router = require('express').Router

const getCanvassHouseHoldService = require('../../../services/canvass/getCanvassHouseHold')

module.exports = Router({ mergeParams: true }).post('/getCanvassHouseHold', async (req, res, next) => {
    try {
        res.send(await getCanvassHouseHoldService.getCanvassHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})