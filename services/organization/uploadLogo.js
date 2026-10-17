const mongoose = require('mongoose');
var Organization = require('../../models/organizations/organization')
var OrgLogo = require('../../models/organizations/orgLogo')

const MAX_BYTES = 2000000
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// The multipart field name is the org ID, so it must be a real org ID
const uploadLogo = async(data) => {
    try {
        var file = data.files?.[0]
        if(!file || data.files.length !== 1) return {success: false, msg: "Choose one image to upload."}

        var orgID = file.fieldname
        if(!mongoose.Types.ObjectId.isValid(orgID) || String(new mongoose.Types.ObjectId(orgID)) !== orgID){
            return {success: false, msg: "Invalid organization."}
        }
        if(!(await Organization.exists({_id: orgID}))) return {success: false, msg: "This organization no longer exists."}

        if(!IMAGE_TYPES.includes(file.mimetype)) return {success: false, msg: "The logo must be a PNG, JPEG or WebP image."}
        if(file.buffer.length > MAX_BYTES) return {success: false, msg: "Image file is too large. Max size is 2 MB."}

        try {
            await OrgLogo.updateOne(
                {orgID},
                {$set: {data: file.buffer, contentType: file.mimetype, updatedAt: new Date()}},
                {upsert: true}
            )
        } catch(e){
            console.log(e.message)
            return {success: false, msg: "Failed to save the logo."}
        }

        return {success: true, msg: 'Logo Uploaded Successfully'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {uploadLogo}
