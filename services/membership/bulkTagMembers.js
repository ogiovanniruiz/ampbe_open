var Membership = require('../../models/people/membership')
var {asList, ensureOrgTag} = require('./memberUtils')
var {checkTagValues, setTagPipeline} = require('./memberTags')

// Adds one tag to every member in any of the selected uploads, petitions, tags or organizer lists
const bulkTagMembers = async(detail) => {
    try {
        var tag = String(detail.tag || '').trim()
        if(!detail.orgID || !tag) return {success: false, msg: "A tag is required."}

        var uploadIDs = asList(detail.uploadIDs).map(String)
        var activityIDs = asList(detail.activityIDs)
        var tags = asList(detail.tags)
        var userIDs = asList(detail.userIDs)

        // Same lists as the Membership sidebar (see sourceQuery); uploaded members aren't in an organizer's list
        var orQuery = []
        if(uploadIDs.length) orQuery.push({'enrollment.source': 'Upload', 'enrollment.sourceID': {$in: uploadIDs}})
        if(activityIDs.length) orQuery.push({activityIDs: {$in: activityIDs}})
        if(tags.length) orQuery.push({'tags.label': {$in: tags}})
        if(userIDs.length) orQuery.push({'enrollment.createdBy': {$in: userIDs}, 'enrollment.source': {$ne: 'Upload'}})
        if(!orQuery.length) return {success: false, msg: "Select at least one list."}

        // Reuse an existing tag's spelling; otherwise add the tag to the organization
        var checked = await checkTagValues(detail.orgID, [{label: tag, value: detail.value}], {strict: true})
        if(checked.msg) return {success: false, msg: checked.msg}
        var value = checked.tags[0].value || ''

        var orgTag = await ensureOrgTag(detail.orgID, checked.tags[0].label)
        if(!orgTag) return {success: false, msg: "Organization not found."}
        tag = orgTag.tag
        var created = orgTag.created

        // Setting the tag replaces a member's earlier value for it
        var result = await Membership.updateMany({'enrollment.orgID': detail.orgID, $or: orQuery}, setTagPipeline(tag, value))

        return {success: true, tag: tag, value: value, created: created, matched: result.matchedCount, tagged: result.modifiedCount}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {bulkTagMembers}
