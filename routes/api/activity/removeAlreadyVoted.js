const Router = require('express').Router

const removeAlreadyVotedService = require('../../../services/activity/removeAlreadyVoted')

module.exports = Router({ mergeParams: true }).post('/removeAlreadyVoted', async (req, res, next) => {
    try {
        res.send(await removeAlreadyVotedService.removeAlreadyVoted(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})