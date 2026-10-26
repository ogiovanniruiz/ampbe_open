var OrgServiceAccount = require('../../models/organizations/orgServiceAccount')

const removeServiceAccount = async(data) => {
    try {
        var orgID = String(data.orgID || '')
        if(!orgID) return {success: false, msg: "Invalid organization."}

        await OrgServiceAccount.deleteOne({orgID})
        return {success: true, msg: 'Key Removed'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeServiceAccount}
