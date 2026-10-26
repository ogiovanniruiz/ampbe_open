const Router = require('express').Router

const getMemberMetaDataService = require('../../../services/membership/getMemberMetaData')

module.exports = Router({ mergeParams: true }).post('/getMemberMetaData', async (req, res, next) => {
    try {
        res.send(await getMemberMetaDataService.getMemberMetaData(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})