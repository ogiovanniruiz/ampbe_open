const Router = require('express').Router

const editNonResponseSetService = require('../../../../services/script/nonResponseSet/editNonResponseSet')

module.exports = Router({ mergeParams: true }).post('/editNonResponseSet', async (req, res, next) => {
    try {
        res.send(await editNonResponseSetService.editNonResponseSet(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})