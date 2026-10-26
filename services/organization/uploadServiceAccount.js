const mongoose = require('mongoose');
var Organization = require('../../models/organizations/organization')
var OrgServiceAccount = require('../../models/organizations/orgServiceAccount')

const MAX_BYTES = 20000

// The multipart field name is the org ID, so it must be a real org ID
const uploadServiceAccount = async(data) => {
    try {
        var file = data.files?.[0]
        if(!file || data.files.length !== 1) return {success: false, msg: "Choose one key file to upload."}

        var orgID = file.fieldname
        if(!mongoose.Types.ObjectId.isValid(orgID) || String(new mongoose.Types.ObjectId(orgID)) !== orgID){
            return {success: false, msg: "Invalid organization."}
        }
        if(!(await Organization.exists({_id: orgID}))) return {success: false, msg: "This organization no longer exists."}

        if(file.buffer.length > MAX_BYTES) return {success: false, msg: "That file is too large to be a service account key."}

        var text = file.buffer.toString('utf8')
        var key
        try {
            key = JSON.parse(text)
        } catch(e){
            return {success: false, msg: "That file isn't a JSON key file."}
        }
        if(key?.type !== 'service_account' || !key.private_key || !key.client_email || !key.project_id){
            return {success: false, msg: "That file isn't a Google service account key."}
        }

        var updatedAt = new Date()
        try {
            await OrgServiceAccount.updateOne(
                {orgID},
                {$set: {key: text, clientEmail: key.client_email, projectId: key.project_id, updatedAt}},
                {upsert: true}
            )
        } catch(e){
            console.log(e.message)
            return {success: false, msg: "Failed to save the key."}
        }

        return {success: true, msg: 'Key Uploaded Successfully', serviceAccount: {clientEmail: key.client_email, projectId: key.project_id, updatedAt}}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {uploadServiceAccount}
