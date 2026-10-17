var Membership = require('../../../models/people/membership');
var Activity = require('../../../models/activities/activity');
var mongoose = require('mongoose');
var FindOneVoter = require('./findOneVoter');

var CheckExistingMember = require('./checkExistingMember')
var {activitySource} = require('../memberFields')

// Petitions can turn the voter file check off; everything else (e.g. Add member) always checks
const shouldCheckVoterfile = async(member) => {
    var activityID = member.activityIDs && member.activityIDs[0]
    if(!activityID || !mongoose.Types.ObjectId.isValid(activityID)) return true

    var activity = await Activity.findOne({_id: activityID}, {activityType: 1, petitionMetadata: 1})
    if(!activity || activity.activityType !== 'Petition') return true
    return !(activity.petitionMetadata && activity.petitionMetadata.checkVoterfile === false)
}

// Who added the member and from where; the server sets these (and the date), whatever the client sent
const setProvenance = async(member) => {
    var client = member.enrollment || {}
    var activityID = member.activityIDs && member.activityIDs[0]
    var source = await activitySource(activityID)
    var createdBy = client.createdBy ? String(client.createdBy) : undefined

    member.enrollment = {
        ...client,
        source: source || 'Manual',
        sourceID: source ? String(activityID) : createdBy,
        createdBy: createdBy,
        dateCreated: new Date(),
    }
}

const createMemberWithForm = async(member) => {
    try {

        await setProvenance(member)

        var checkedMember = await CheckExistingMember.checkExistingMember(member)

        if(checkedMember){
            return checkedMember
        }

        var personID = new mongoose.Types.ObjectId();

        member.resident.personID = personID;
        member.address.streetNum = personID;

        var newMember = new Membership(member);

        await newMember.save();

        // The member is saved; matching and geocoding log their own failures instead of failing the save
        var checkVoterfile = true
        try {
            checkVoterfile = await shouldCheckVoterfile(member)
        } catch(e){
            console.log(e.message)
        }

        if(checkVoterfile){
            await FindOneVoter.findOneVoter(newMember);
        } else {
            console.log("Voter file check is off for this petition.")
            await FindOneVoter.geocodeOnly(newMember);
        }

        return newMember;
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createMemberWithForm}
