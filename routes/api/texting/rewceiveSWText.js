const Router = require('express').Router

const receiveSWTextService = require('../../../services/texting/receiveSWText')

module.exports = Router({ mergeParams: true }).post('/receiveSWText', async (req, res, next) => {
    try {
        res.send(await receiveSWTextService.receiveSWText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})