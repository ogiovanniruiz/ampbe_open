var Membership = require('../../models/people/membership')
var {asObjectIds, ensureOrgTag} = require('./memberUtils')
var {checkTagValues, setTagPipeline} = require('./memberTags')

// Adds a tag to, removes a tag from, or deletes the selected members of one org
const bulkUpdateMembers = async(detail) => {
    try {
        var ids = asObjectIds(detail.memberIDs)
        if(!detail.orgID || !ids.length) return {success: false, msg: "Select at least one member."}

        var query = {'enrollment.orgID': detail.orgID, _id: {$in: ids}}
        var tag = String(detail.tag || '').trim()

        if(detail.action === 'addTag'){
            // The value must be one the tag's definition offers; setting it replaces the member's old value
            var checked = await checkTagValues(detail.orgID, [{label: tag, value: detail.value}], {strict: true})
            if(checked.msg) return {success: false, msg: checked.msg}
            var orgTag = await ensureOrgTag(detail.orgID, checked.tags[0].label)
            if(!orgTag) return {success: false, msg: "A tag is required."}
            var added = await Membership.updateMany(query, setTagPipeline(orgTag.tag, checked.tags[0].value))
            return {success: true, tag: orgTag.tag, value: checked.tags[0].value || '', created: orgTag.created, matched: added.matchedCount, modified: added.modifiedCount}
        }

        if(detail.action === 'removeTag'){
            if(!tag) return {success: false, msg: "A tag is required."}
            var removed = await Membership.updateMany(query, {$pull: {tags: {label: tag}}})
            return {success: true, tag: tag, matched: removed.matchedCount, modified: removed.modifiedCount}
        }

        if(detail.action === 'delete'){
            var deleted = await Membership.deleteMany(query)
            return {success: true, matched: deleted.deletedCount, modified: deleted.deletedCount}
        }

        return {success: false, msg: "Unknown action."}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {bulkUpdateMembers}
