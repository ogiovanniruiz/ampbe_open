const Router = require('express').Router
var multer  = require('multer');
var upload = multer();

const uploadServiceAccountService = require('../../../services/organization/uploadServiceAccount')

module.exports = Router({ mergeParams: true }).post('/uploadServiceAccount', [upload.any(),async (req, res, next) => {
    try {
        res.send(await uploadServiceAccountService.uploadServiceAccount(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}])