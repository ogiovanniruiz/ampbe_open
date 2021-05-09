const Router = require('express').Router

const updateDataManagerService = require('../../../services/user/updateDataManager')

module.exports = Router({ mergeParams: true }).post('/updateDataManager', async (req, res, next) => {
    try {
        res.send(await updateDataManagerService.updateDataManager(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})