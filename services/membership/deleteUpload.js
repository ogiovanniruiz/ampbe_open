var Uploads = require('../../models/organizations/upload')
var Membership = require('../../models/organizations/membership')

const deleteUpload = async(upload) => {
    try { 
        await Membership.deleteMany({'resident.uploadID': upload.uploadID})

        return await Uploads.deleteOne({_id: upload.uploadID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteUpload}