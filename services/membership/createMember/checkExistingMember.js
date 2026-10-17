var Membership = require('../../../models/people/membership');
var {ensureTag} = require('../../organization/tags/orgTags');
var {applyConsent, hasTextingConsent, hasEmailConsent} = require('../consent');
var {toMemberTags, mergeMemberTags, checkTagValues} = require('../memberTags');
const checkExistingMember = async(member) => {

    try{

    member.enrollment = member.enrollment || {}
    var orgID = member.enrollment.orgID

    // Consent arrives on member.enrollment, or as the old consent tags; either way it ends up on the flags.
    // The incoming member is updated too, so a caller that saves it as a new member keeps the consent.
    var split = toMemberTags(member.tags)
    var consent = {texting: split.texting || hasTextingConsent(member), email: split.email || hasEmailConsent(member)}
    member.tags = split.tags
    member.activityIDs = member.activityIDs || []
    // Re-stamp incoming consent here so the server sets dateUpdated, not the client
    if(member.enrollment){
        delete member.enrollment.optinTexting
        delete member.enrollment.optinEmail
    }
    applyConsent(member, consent)

    // Every other incoming tag (e.g. the activity name) is an org tag
    // Values a tag doesn't offer are dropped, labels take the org's spelling
    var incomingTags = (await checkTagValues(orgID, split.tags)).tags
    member.tags = incomingTags
    for(var incomingTag of incomingTags){
        await ensureTag(orgID, incomingTag.label);
    }

    var orQuery = [];

    if(member.resident.phones.length > 0) {
        orQuery.push({'resident.phones.number': member.resident.phones[0].number })
    }
    
    if(member.resident.emails.length > 0) {
        // $in: comparing the whole array only matched members with exactly the same email list
        orQuery.push({'resident.emails': {$in: member.resident.emails} })
    }

    if(member.fullAddress1 != '') {
        orQuery.push({'fullAddress1': member.fullAddress1 })
    }

    var queryMember = {'enrollment.orgID': orgID,
                       'resident.name.firstName': member.resident.name.firstName,
                       '$or': orQuery};

    var foundMember = await Membership.findOne(queryMember);
    
    if(foundMember){

        // Merge all of them, not just the first; a new value for a tag replaces the old one
        foundMember.tags = mergeMemberTags(foundMember.tags, incomingTags)

        foundMember.activityIDs = foundMember.activityIDs || []
        if(member.activityIDs.length > 0 && !foundMember.activityIDs.includes(member.activityIDs[0])){
            foundMember.activityIDs.push(member.activityIDs[0]);
        }

        applyConsent(foundMember, consent)

        // A member with no recorded source takes this one (e.g. it now belongs to this upload)
        if(member.enrollment.source && !foundMember.enrollment?.source){
            foundMember.set('enrollment.source', member.enrollment.source)
            if(member.enrollment.sourceID) foundMember.set('enrollment.sourceID', member.enrollment.sourceID)
            if(member.enrollment.createdBy && !foundMember.enrollment?.createdBy) foundMember.set('enrollment.createdBy', member.enrollment.createdBy)
        }

        await foundMember.save();
        return foundMember
    }
    }catch(e){
        throw new Error(e.message)
    }

    return false

}

module.exports = {checkExistingMember}