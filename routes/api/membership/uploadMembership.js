const Router = require('express').Router
var multer  = require('multer');
var upload = multer();

const uploadMembershipService = require('../../../services/membership/uploadMembership')

module.exports = Router({ mergeParams: true }).post('/uploadMembership', [upload.any(),async (req, res, next) => {
    try {
        res.send(await uploadMembershipService.uploadMembership(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}])