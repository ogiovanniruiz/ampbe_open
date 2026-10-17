var mongoose = require('mongoose')
var Activity = require('../../models/activities/activity')

// Where member data lives:
// enrollment holds who/where/when they joined; tags, activityIDs, isRegisteredVoter, geocoded and mergedPersonIDs are top-level.

const ORG = 'enrollment.orgID'

// enrollment.source for a member added by an activity of this type
const SOURCE_TYPE_BY_ACTIVITY = {Canvass: 'Canvassing', Phonebank: 'Phonebanking', Texting: 'Texting', Petition: 'Petition'}

// The provenance part of a new member's enrollment (consent is set separately, see consent.js)
const newEnrollment = ({orgID, source, sourceID, createdBy}) => {
    var enrollment = {orgID: orgID, dateCreated: new Date()}
    if(source) enrollment.source = source
    if(sourceID) enrollment.sourceID = String(sourceID)
    if(createdBy) enrollment.createdBy = String(createdBy)
    return enrollment
}

// Members an upload created
const uploadQuery = (uploadID) => ({'enrollment.source': 'Upload', 'enrollment.sourceID': String(uploadID)})

// Members of one sidebar list on the Membership page. Uploaded members stay out of an organizer's list.
const sourceQuery = (type, id) => {
    if(type === 'upload') return uploadQuery(id)
    if(type === 'tag') return {'tags.label': id}
    if(type === 'organizer') return {'enrollment.createdBy': id, 'enrollment.source': {$ne: 'Upload'}}
    if(type === 'activity') return {activityIDs: id}
    return {}
}

// enrollment.source for a member added from this activity, or null when the activity isn't found
const activitySource = async(activityID) => {
    if(!activityID || !mongoose.Types.ObjectId.isValid(activityID)) return null
    var activity = await Activity.findOne({_id: activityID}, {activityType: 1}).lean()
    return activity ? SOURCE_TYPE_BY_ACTIVITY[activity.activityType] || null : null
}

module.exports = {ORG, SOURCE_TYPE_BY_ACTIVITY, newEnrollment, uploadQuery, sourceQuery, activitySource}
