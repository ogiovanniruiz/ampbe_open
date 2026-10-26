const Router = require('express').Router

const addCanvassHouseholdResidentService = require('../../../services/canvass/addCanvassHouseholdResident')

module.exports = Router({ mergeParams: true }).post('/addCanvassHouseholdResident', async (req, res, next) => {
    try {
        res.send(await addCanvassHouseholdResidentService.addCanvassHouseholdResident(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
