const Router = require('express').Router
var multer  = require('multer');
var upload = multer();

const uploadTextImageService = require('../../../services/texting/uploadTextImage')

module.exports = Router({ mergeParams: true }).post('/uploadTextImage', [upload.any(),async (req, res, next) => {
    try {
        res.send(await uploadTextImageService.uploadTextImage(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}])
