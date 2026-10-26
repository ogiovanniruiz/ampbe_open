const crypto = require('crypto');
const mongoose = require('mongoose');
var Organization = require('../../models/organizations/organization')
var TextImage = require('../../models/activities/textbank/textImage')

// Carriers reject or recompress larger MMS attachments
const MAX_BYTES = 1000000
const IMAGE_TYPES = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif'}

const uploadTextImage = async(data) => {
    try {
        var file = data.files?.[0]
        if(!file || data.files.length !== 1) return {success: false, msg: "Choose one image to upload."}

        var orgID = data.body?.orgID
        if(!mongoose.Types.ObjectId.isValid(orgID) || String(new mongoose.Types.ObjectId(orgID)) !== orgID){
            return {success: false, msg: "Invalid organization."}
        }
        if(!(await Organization.exists({_id: orgID}))) return {success: false, msg: "This organization no longer exists."}

        var ext = IMAGE_TYPES[file.mimetype]
        if(!ext) return {success: false, msg: "The image must be a JPEG, PNG or GIF."}
        if(file.buffer.length > MAX_BYTES) return {success: false, msg: "Image file is too large. Max size is 1 MB."}

        // The key is the only thing guarding the public URL, so make it unguessable
        var key = crypto.randomBytes(16).toString('hex')

        try {
            await TextImage.create({key, orgID, data: file.buffer, contentType: file.mimetype, size: file.buffer.length})
        } catch(e){
            console.log(e.message)
            return {success: false, msg: "Failed to save the image."}
        }

        return {success: true, url: process.env.be + '/media/' + key + ext, msg: 'Image Uploaded Successfully'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {uploadTextImage}
