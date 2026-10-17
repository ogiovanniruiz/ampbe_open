const Router = require('express').Router

const getBlocksByBoundsService = require('../../../../services/shape/block/getBlocksByBounds')

module.exports = Router({ mergeParams: true }).post('/getBlocksByBounds', async (req, res, next) => {
    try {
        res.send(await getBlocksByBoundsService.getBlocksByBounds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})