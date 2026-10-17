const Router = require('express').Router

const updateMemberOptinsService = require('../../../services/membership/updateMemberOptins')

module.exports = Router({ mergeParams: true }).post('/updateMemberOptins', async (req, res, next) => {
    try {
        res.send(await updateMemberOptinsService.updateMemberOptins(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
