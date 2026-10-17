var Membership = require('../../models/people/membership')
var Uploads = require('../../models/organizations/upload')
var mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const getMemberMetaData = async(detail) => {
    try { 
        var personIDs = detail.residents.map( x => {return x.personID})
        var members = await Membership.find({'enrollment.orgID': detail.orgID, $or: [{'resident.personID': {$in: personIDs}}, {mergedPersonIDs: {$in: personIDs}}]})

        var returnData = []
        for (var i = 0; i < members.length; i++){
            // Only uploaded members have an upload to name
            var enrollment = members[i].enrollment || {}
            var upload = enrollment.source === 'Upload' && ObjectId.isValid(enrollment.sourceID) ? await Uploads.findOne({_id: enrollment.sourceID}) : null
            if(upload) returnData.push({uploadName: upload.uploadName, memberName: members[i].resident.name.firstName})
        }

        return returnData
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMemberMetaData}