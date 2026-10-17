var Organization = require('../../../models/organizations/organization')
var Membership = require('../../../models/people/membership')
var Group = require('../../../models/groups/group')
var Activity = require('../../../models/activities/activity')
var {tagLabels, findTag, isStyled, plainTag} = require('./orgTags')

// A saved group's tag filters pointed at the merged tag; null when nothing changes.
// Old Tags rows (lists of names) are relabelled. Tags filter rows ({label, values}) for the merged tags are
// combined into one row: a value the merged tag doesn't offer becomes '' (no value, where those members end up),
// and a row that matched any value keeps matching any value.
const mergedQueries = (queries, sources, target, offered) => {
    if(!queries) return null
    var next = {...queries}, changed = false
    var merged = [target, ...sources]

    if(Array.isArray(queries.tags)){
        next.tags = queries.tags.map(row => {
            if(!Array.isArray(row) || !row.some(t => sources.includes(t))) return row
            changed = true
            return Array.from(new Set(row.map(t => sources.includes(t) ? target : t)))
        })
    }

    var rows = Array.isArray(queries.tagValues) && Array.isArray(queries.tagValues[0]) ? queries.tagValues[0] : null
    if(rows && rows.some(row => sources.includes(row?.label))){
        changed = true
        var mergedRows = rows.filter(row => merged.includes(row?.label))
        var anyValue = mergedRows.some(row => !(row.values || []).length)
        var values = anyValue ? [] : [...new Set(mergedRows.flatMap(row => row.values || []).map(v => v === '' || offered.has(v) ? v : ''))]
        var at = rows.findIndex(row => merged.includes(row?.label))
        var rest = rows.filter(row => !merged.includes(row?.label))
        next.tagValues = [[...rest.slice(0, at), {label: target, values}, ...rest.slice(at)], ...queries.tagValues.slice(1)]
    }
    return changed ? next : null
}

// Merges two or more tags into one: on members, in the org's tag list and in saved group filters
const mergeTags = async(data) => {
    try {
        var newTag = String(data.newTag || '').trim()
        var tags = Array.from(new Set((Array.isArray(data.tags) ? data.tags : []).map(t => String(t || '')).filter(Boolean)))

        if(!data.orgID || !newTag) return {success: false, msg: "A new tag name is required."}
        if(tags.length < 2) return {success: false, msg: "Select at least two tags to merge."}

        var org = await Organization.findOne({_id: data.orgID})
        if(!org) return {success: false, msg: "Organization not found."}

        var labels = tagLabels(org)
        var missing = tags.filter(t => !labels.includes(t))
        if(missing.length) return {success: false, msg: "These tags no longer exist: " + missing.join(', ')}

        // Reuse an existing tag's spelling (it may be one of the merged tags)
        var target = findTag(org, newTag)?.label || newTag
        var sources = tags.filter(t => t !== target)
        if(!sources.length) return {success: false, msg: "Nothing to merge."}

        // One entry for the merged tag: its own values and colors, otherwise the first merged tag's that has
        // some, otherwise a plain tag. It takes the place of the first of them in the list.
        var list = org.tagDefinitions || []
        var mergedEntries = [target, ...sources].map(label => list.find(d => d.label === label)).filter(Boolean)
        var styled = mergedEntries.find(isStyled)
        var base = styled || mergedEntries.find(d => d.label === target)
        var targetDefinition = base ? {...(base.toObject ? base.toObject() : base), label: target} : plainTag(target, data.userID)
        var at = list.findIndex(d => mergedEntries.includes(d))
        var rest = list.filter(d => !mergedEntries.includes(d))
        org.tagDefinitions = at < 0 ? [...rest, targetDefinition] : [...rest.slice(0, at), targetDefinition, ...rest.slice(at)]
        var offered = new Set((targetDefinition.values || []).map(v => v.value))

        // Each member ends up with one entry for the merged tag. Its value is the member's value for the
        // merged tag if it had one, otherwise the first merged tag's value, and only if the merged tag offers it.
        var mergedLabels = [target, ...sources]
        var members = await Membership.find({'enrollment.orgID': data.orgID, 'tags.label': {$in: sources}}, {tags: 1}).lean()
        var ops = members.map(member => {
            var tags = member.tags || []
            var value = mergedLabels.map(label => tags.find(t => t.label === label)?.value).find(v => v && offered.has(v))
            var kept = tags.filter(t => !mergedLabels.includes(t.label))
            return {updateOne: {filter: {_id: member._id}, update: {$set: {tags: [...kept, value ? {label: target, value} : {label: target}]}}}}
        })
        if(ops.length) await Membership.bulkWrite(ops, {ordered: false})
        var added = {matchedCount: members.length}

        await org.save()

        // Saved filters are rows of tag names ({tags: [[...], ...]}); point them at the merged tag
        var groupsUpdated = 0
        var groups = await Group.find({orgID: data.orgID, $or: [{'queries.tags': {$exists: true}}, {'queries.tagValues': {$exists: true}}]})
        for(var group of groups){
            var queries = mergedQueries(group.queries, sources, target, offered)
            if(queries){
                group.queries = queries
                group.markModified('queries')
                await group.save()
                groupsUpdated++
            }
        }

        // Merged-away names leave activities' hidden lists; the merged tag keeps its own setting
        await Activity.updateMany({orgIDs: data.orgID, tagsToHide: {$in: sources}}, {$pull: {tagsToHide: {$in: sources}}})

        return {success: true, tag: target, members: added.matchedCount, groups: groupsUpdated, removed: sources}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {mergeTags, mergedQueries}
