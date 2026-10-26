var Membership = require('../../models/people/membership')
var CheckExistingMember = require('./createMember/checkExistingMember');
var FindOneVoter = require('./createMember/findOneVoter');
var {applyConsent} = require('./consent');
var {toMemberTags, checkTagValues} = require('./memberTags');


const editMember = async(newMemberDetail) => {
    try { 

        console.log(newMemberDetail)
        var member = await Membership.findById(newMemberDetail._id)
        if(!member) return {status: false, msg: 'Member not found.'}

        // The dialog sends the member's full tag list; values must be ones each tag offers
        var incoming = toMemberTags(newMemberDetail.tags)
        var checked = await checkTagValues(member.enrollment?.orgID, incoming.tags, {strict: true})
        if(checked.msg) return {status: false, msg: checked.msg}

        member.resident.name = newMemberDetail.resident.name;
        member.resident.phones = newMemberDetail.resident.phones;
        member.resident.emails = newMemberDetail.resident.emails;
        // Consent comes from the dialog's switches and can be turned off; old consent tags are dropped
        member.tags = checked.tags;
        var enrollment = newMemberDetail.enrollment
        if(enrollment){
            applyConsent(member, {texting: enrollment.optinTexting?.status, email: enrollment.optinEmail?.status}, {allowRevoke: true})
        }
        member.fullAddress1 = newMemberDetail.fullAddress1;
        member.fullAddress2 = newMemberDetail.fullAddress2;
        member.address.unit = newMemberDetail.address.unit;
        member.address.city = newMemberDetail.address.city;
        member.address.zip = newMemberDetail.address.zip;
        member.address.state = newMemberDetail.address.state;

        await member.save();

        // Edited details may now match a voter; findOneVoter logs its own failures
        if(!member.isRegisteredVoter){
            await FindOneVoter.findOneVoter(member);
        }

        return {status: true, member: member}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editMember}
