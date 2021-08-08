const Router = require('express').Router

const updateUserOrgLevelService = require('../../../services/user/updateUserOrgLevel')

module.exports = Router({ mergeParams: true }).post('/updateUserOrgLevel', async (req, res, next) => {
    try {
        res.send(await updateUserOrgLevelService.updateUserOrgLevel(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})