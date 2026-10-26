var Uploads = require('../../../models/organizations/upload')
var Membership = require('../../../models/people/membership')
var {uploadQuery} = require('../memberFields')

const deleteUpload = async(upload) => {
    try { 
        await Membership.deleteMany(uploadQuery(upload.uploadID))

        return await Uploads.deleteOne({_id: upload.uploadID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteUpload}