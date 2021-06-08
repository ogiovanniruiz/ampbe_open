const Router = require('express').Router

const getCanvassHouseholdsService = require('../../../services/canvass/getCanvassHouseholds')

module.exports = Router({ mergeParams: true }).post('/getCanvassHouseholds', async (req, res, next) => {
    try {
        res.send(await getCanvassHouseholdsService.getCanvassHouseholds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})