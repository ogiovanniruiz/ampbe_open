const Router = require('express').Router

const getEstimateService = require('../../../services/group/getEstimate')

module.exports = Router({ mergeParams: true }).post('/getEstimate', async (req, res, next) => {
    try {
        res.send(await getEstimateService.getEstimate(req.body))
    } catch(e) {
        console.log(e.message)
        // Problems with the group itself carry a message meant for the user
        if (e.status === 422) return res.status(422).send({ message: e.message })
        res.sendStatus(500)
    }
})