var Upload = require('../../models/organizations/upload')


const editUpload = async(data) => {
    try { 
        return await Upload.updateOne({_id: data.uploadID},{$set: {uploadName: data.newUploadName}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editUpload}