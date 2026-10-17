var mongoose = require('mongoose')
var User = require('../../models/users/user')
const { TERMS_VERSION } = require('../../config/terms')

const fullName = user => [user.name?.firstName, user.name?.lastName].filter(Boolean).join(' ') || user.loginEmail || 'An owner'

// The terms are accepted once per organization: by any one of its owners, for the current version
const getOrgTermsStatus = async(data) => {
    try {
        var orgID = String(data.orgID || '')
        if(!mongoose.Types.ObjectId.isValid(orgID)) throw new Error("Organization not found.")

        var owners = await User.find({orgPermissions: {$elemMatch: {orgID, level: 'OWNER'}}}, 'name loginEmail userAgreements').lean()

        var acceptedBy = null
        for(var owner of owners){
            var agreement = (owner.userAgreements || []).find(a => a.version === TERMS_VERSION && a.orgID === orgID)
            if(agreement && (!acceptedBy || new Date(agreement.date) < new Date(acceptedBy.date))){
                acceptedBy = {userID: String(owner._id), name: fullName(owner), date: agreement.date}
            }
        }

        return {
            version: TERMS_VERSION,
            accepted: !!acceptedBy,
            acceptedBy: acceptedBy,
            hasOwner: owners.length > 0,
            ownerNames: owners.map(fullName),
        }
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgTermsStatus}
