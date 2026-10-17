const Router = require('express').Router

const getBlocksService = require('../../../../services/shape/block/getBlocks')

module.exports = Router({ mergeParams: true }).post('/getBlocks', async (req, res, next) => {
    try {
        res.send(await getBlocksService.getBlocks(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
