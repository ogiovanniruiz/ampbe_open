var Organization = require('../../../models/organizations/organization')
var {isConsentTag} = require('../../membership/consent')
var {tagLabels} = require('./orgTags')

// The org's tag names, newest first
const getTags = async(orgDetail) => {
    try {
        var org = await Organization.findOne({_id: orgDetail.orgID}, {tagDefinitions: 1}).lean()
        // Consent tags are left over from before consent moved to member.enrollment
        return tagLabels(org).filter(tag => !isConsentTag(tag, 'texting') && !isConsentTag(tag, 'email')).reverse();

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTags}
