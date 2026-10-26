var mongoose = require('mongoose');
var Membership = require('../../models/people/membership')
var Uploads = require('../../models/organizations/upload')
var Activity = require('../../models/activities/activity')
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')

const { ObjectId } = mongoose.Types;

const userName = (user) => {
    if(!user) return ''
    var name = [user.name?.firstName, user.name?.lastName].filter(part => part).join(' ')
    return name || user.loginEmail || ''
}

// Where a member came from and every time the org contacted them
const getMemberHistory = async(detail) => {
    try {
        if(!ObjectId.isValid(detail.memberID)) return {success: false, msg: 'Member not found.'}
        var member = await Membership.findOne({_id: detail.memberID, 'enrollment.orgID': detail.orgID}).lean()
        if(!member) return {success: false, msg: 'Member not found.'}

        var enrollment = member.enrollment || {}
        var uploadID = enrollment.source === 'Upload' ? enrollment.sourceID : null

        var upload = ObjectId.isValid(uploadID) ? await Uploads.findOne({_id: uploadID}, {uploadName: 1, date: 1}).lean() : null
        var addedBy = ObjectId.isValid(enrollment.createdBy) ? await User.findOne({_id: enrollment.createdBy}, {name: 1, loginEmail: 1}).lean() : null

        var personID = member.resident?.personID
        var records = personID
            ? await ActivityContactRecord.find({orgID: detail.orgID, personID: {$in: [personID, ...(member.mergedPersonIDs || [])]}},
                {activityID: 1, activityType: 1, creationDate: 1, pass: 1, complete: 1, nonResponse: 1, surveyResponse: 1, userID: 1}).sort({creationDate: -1}).limit(200).lean()
            : []

        var activityIDs = [...new Set([...(member.activityIDs || []), ...records.map(r => r.activityID)])].filter(id => ObjectId.isValid(id))
        var activities = await Activity.find({_id: {$in: activityIDs}}, {name: 1, activityType: 1}).lean()
        var activityByID = new Map(activities.map(a => [String(a._id), a]))

        var userIDs = [...new Set(records.map(r => r.userID))].filter(id => ObjectId.isValid(id))
        var users = await User.find({_id: {$in: userIDs}}, {name: 1, loginEmail: 1}).lean()
        var userByID = new Map(users.map(u => [String(u._id), u]))

        return {
            success: true,
            source: enrollment.source || '',
            date: enrollment.dateCreated,
            upload: upload ? {uploadName: upload.uploadName, date: upload.date} : null,
            addedBy: userName(addedBy),
            activities: (member.activityIDs || []).map(id => ({
                _id: id,
                name: activityByID.get(String(id))?.name || 'Deleted activity',
                activityType: activityByID.get(String(id))?.activityType || '',
            })),
            contacts: records.map(r => ({
                date: r.creationDate,
                activityName: activityByID.get(String(r.activityID))?.name || 'Deleted activity',
                activityType: r.activityType,
                pass: r.pass,
                complete: r.complete,
                contactedBy: userName(userByID.get(String(r.userID))),
                nonResponse: r.nonResponse?.nonResponse || '',
                responses: (r.surveyResponse?.questionResponses || []).map(q => ({question: q.question, response: q.response})),
            })),
        }
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMemberHistory}
