var Uploads = require('../../models/organizations/upload')

const getUploads = async(detail) => {
    try { 
        return await Uploads.find({orgID: detail.orgID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getUploads}