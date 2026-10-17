const Router = require('express').Router

const createCanvassHouseholdService = require('../../../services/canvass/createCanvassHousehold')

module.exports = Router({ mergeParams: true }).post('/createCanvassHousehold', async (req, res, next) => {
    try {
        res.send(await createCanvassHouseholdService.createCanvassHousehold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
