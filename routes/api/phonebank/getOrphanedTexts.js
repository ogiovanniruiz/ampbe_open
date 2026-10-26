const Router = require('express').Router

const getOrphanedTextsService = require('../../../services/phonebank/getOrphanedTexts')

module.exports = Router({ mergeParams: true }).post('/getOrphanedTexts', async (req, res, next) => {
    try {
        res.send(await getOrphanedTextsService.getOrphanedTexts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})