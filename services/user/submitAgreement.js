var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')
const { TERMS_VERSION } = require('../../config/terms')

// Terms are accepted per organization by an owner: the user records which org, the org records which user
const submitAgreement = async(data) => {
    try {
        var user = await User.findOne({_id: data.user._id});
        var org = await Organization.findOne({_id: data.orgID});

        if(!user || !org){
            throw new Error("User or organization not found.")
        }

        var userID = user._id.toString()
        var orgID = org._id.toString()

        // One owner accepts on behalf of the whole organization
        if(!(user.orgPermissions || []).some(p => p.orgID === orgID && p.level === 'OWNER')){
            return {success: false, msg: "Only an owner of this organization can accept the Terms of Use."}
        }

        // Always record the server's current version, never one sent by the client
        if (!user.userAgreements.some(agreement => agreement.version === TERMS_VERSION && agreement.orgID === orgID)) {
            user.userAgreements.push({version: TERMS_VERSION, orgID: orgID})
            await user.save()
        }

        if (!org.orgAgreements.some(agreement => agreement.version === TERMS_VERSION && agreement.userID === userID)) {
            org.orgAgreements.push({version: TERMS_VERSION, userID: userID})
        }
        org.termsAgreement = true
        await org.save()

        return {success: true, user: user, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitAgreement}
