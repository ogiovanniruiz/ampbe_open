var OrgServiceAccount = require('../../models/organizations/orgServiceAccount')

// Which service account the org uses; never the key itself. {} when none is uploaded
const getOrgServiceAccount = async(data) => {
    try {
        var orgID = String(data.orgID || '')
        if(!orgID) return {}

        var account = await OrgServiceAccount.findOne({orgID}, {clientEmail: 1, projectId: 1, updatedAt: 1, _id: 0}).lean()
        return account || {}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgServiceAccount}
