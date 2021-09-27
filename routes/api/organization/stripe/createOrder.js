const Router = require('express').Router

const createOrderService = require('../../../../services/organization/stripe/createOrder')

module.exports = Router({ mergeParams: true }).post('/createOrder', async (req, res, next) => {
    try {
        res.send(await createOrderService.createOrder(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})