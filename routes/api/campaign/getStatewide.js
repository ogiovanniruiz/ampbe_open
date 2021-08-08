const Router = require('express').Router

const getStatewideService = require('../../../services/campaign/getStatewide')

module.exports = Router({ mergeParams: true }).post('/getStatewide', async (req, res, next) => {
    try {
        res.send(await getStatewideService.getStatewide(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
