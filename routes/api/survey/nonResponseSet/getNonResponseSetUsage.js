const Router = require('express').Router

const getNonResponseSetUsageService = require('../../../../services/survey/nonResponseSet/getNonResponseSetUsage')

module.exports = Router({ mergeParams: true }).post('/getNonResponseSetUsage', async (req, res, next) => {
    try {
        res.send(await getNonResponseSetUsageService.getNonResponseSetUsage(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
