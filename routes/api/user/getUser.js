const Router = require('express').Router

const getUserService = require('../../../services/user/getUser')

module.exports = Router({ mergeParams: true }).post('/getUser', async (req, res, next) => {
    try {
        res.send(await getUserService.getUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }

})