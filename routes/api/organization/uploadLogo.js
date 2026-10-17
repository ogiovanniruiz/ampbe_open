const Router = require('express').Router
var multer  = require('multer');
var upload = multer();

const uploadLogoService = require('../../../services/organization/uploadLogo')

module.exports = Router({ mergeParams: true }).post('/uploadLogo', [upload.any(),async (req, res, next) => {
    try {
        res.send(await uploadLogoService.uploadLogo(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}])