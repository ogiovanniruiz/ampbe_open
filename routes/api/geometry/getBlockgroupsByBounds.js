const Router = require('express').Router

const getBlockgroupsByBoundsService = require('../../../services/geometry/getBlockgroupsByBounds')

module.exports = Router({ mergeParams: true }).post('/getBlockgroupsByBounds', async (req, res, next) => {
    try {
        res.send(await getBlockgroupsByBoundsService.getBlockgroupsByBounds(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
