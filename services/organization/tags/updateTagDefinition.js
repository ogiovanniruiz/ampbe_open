var Organization = require('../../../models/organizations/organization')
var Membership = require('../../../models/people/membership')
var Group = require('../../../models/groups/group')
var Activity = require('../../../models/activities/activity')
var {valueList, labelProblem, colorValues, singleColor} = require('./tagDefinitionRules')
var {findTag} = require('./orgTags')

const fail = (msg) => ({success: false, msg: msg})
const key = (text) => String(text ?? '').trim().toUpperCase()

// Old values -> new: renamed (by `from`, or the same text kept) or removed
const valueChanges = (oldValues, newValues) => {
    var oldByKey = new Map(oldValues.map(v => [key(v), v]))
    var claimed = new Set(), renames = new Map()
    for(var item of newValues){
        var from = oldByKey.get(key(item.from)) ?? oldByKey.get(key(item.value))
        if(from === undefined || claimed.has(key(from))) continue
        claimed.add(key(from))
        if(from !== item.value) renames.set(from, item.value)
    }
    var removed = oldValues.filter(v => !claimed.has(key(v)))
    return {renames, removed}
}

// A member's tags with this tag renamed and its value mapped; null when nothing changes
const updatedMemberTags = (tags, label, newLabel, renames, removed) => {
    var changed = false
    var next = (tags || []).map(tag => {
        if(tag?.label !== label) return tag
        var value = tag.value
        if(value && removed.includes(value)) value = undefined
        else if(value && renames.has(value)) value = renames.get(value)
        if(newLabel === label && value === tag.value) return tag
        changed = true
        return value ? {label: newLabel, value} : {label: newLabel}
    })
    return changed ? next : null
}

// A saved group's queries with this tag renamed in its tag filters and renamed values followed. A removed value
// becomes '' (no value), which is where those members end up, so the group keeps the same members. Null when
// nothing changes.
const updatedQueries = (queries, label, newLabel, renames, removed) => {
    if(!queries) return null
    var next = {...queries}, changed = false

    if(newLabel !== label && Array.isArray(queries.tags)){
        next.tags = queries.tags.map(row => {
            if(!Array.isArray(row) || !row.includes(label)) return row
            changed = true
            return Array.from(new Set(row.map(t => t === label ? newLabel : t)))
        })
    }

    var rows = Array.isArray(queries.tagValues) && Array.isArray(queries.tagValues[0]) ? queries.tagValues[0] : null
    if(rows){
        var nextRows = rows.map(row => {
            if(row?.label !== label) return row
            var values = [...new Set((row.values || []).map(v => removed.includes(v) ? '' : (renames.get(v) ?? v)))]
            if(newLabel !== label || values.length !== (row.values || []).length || values.some((v, i) => v !== row.values[i])) changed = true
            return {...row, label: newLabel, values}
        })
        next.tagValues = [nextRows, ...queries.tagValues.slice(1)]
    }
    return changed ? next : null
}

// Changes a tag's name, values and colors, and keeps members and saved groups in step.
// preview: only counts what would change.
const updateTagDefinition = async(detail) => {
    try {
        var label = String(detail.label || '').trim()
        var newLabel = String(detail.newLabel ?? label).trim()
        var valueType = ['range', 'list'].includes(detail.valueType) ? detail.valueType : 'none'
        if(!detail.orgID || !label) return fail('Missing tag.')
        if(labelProblem(newLabel)) return fail(labelProblem(newLabel))

        var org = await Organization.findOne({_id: detail.orgID})
        if(!org) return fail('Organization not found.')

        // The stored spelling of the tag being edited
        var current = findTag(org, label)
        if(!current) return fail('This tag no longer exists.')
        label = current.label

        var clash = key(newLabel) !== key(label) && !!findTag(org, newLabel)
        if(clash) return fail(`"${newLabel}" is already a tag. Use Merge tags to combine them.`)

        var list = valueList({...detail, valueType})
        if(list.msg) return fail(list.msg)

        // `from` ties each new value to its old text, so a renamed word isn't a removal plus an addition
        var incoming = Array.isArray(detail.values) ? detail.values : []
        var fromByValue = new Map(incoming.filter(v => v && v.from !== undefined).map(v => [key(v.value), String(v.from)]))
        var newValues = list.values.map(value => ({value, from: fromByValue.get(key(value))}))
        var oldValues = (current?.values || []).map(v => v.value)
        var {renames, removed} = valueChanges(oldValues, newValues)

        // What changes for members and saved groups
        var memberFilter = {'enrollment.orgID': detail.orgID, 'tags.label': label}
        var members = await Membership.find(memberFilter, {tags: 1}).lean()
        var memberUpdates = members.map(m => ({_id: m._id, tags: updatedMemberTags(m.tags, label, newLabel, renames, removed)})).filter(m => m.tags)
        var membersCleared = members.filter(m => (m.tags || []).some(t => t.label === label && t.value && removed.includes(t.value))).length
        var membersRenamed = members.filter(m => (m.tags || []).some(t => t.label === label && t.value && renames.has(t.value))).length

        var groups = await Group.find({orgID: detail.orgID, $or: [{'queries.tags': {$exists: true}}, {'queries.tagValues': {$exists: true}}]})
        var groupUpdates = groups.map(g => ({group: g, queries: updatedQueries(g.queries, label, newLabel, renames, removed)})).filter(g => g.queries)

        if(detail.preview){
            return {success: true, preview: {membersCleared, membersRenamed, membersRelabeled: newLabel !== label ? members.length : 0,
                groupsAffected: groupUpdates.length, removed, renamed: [...renames].map(([from, to]) => ({from, to}))}}
        }

        // Organization: the definition (new or replaced) and the tag's name in the tag list
        var definition = {
            label: newLabel,
            valueType: valueType,
            values: colorValues(list.values, detail),
            createdBy: current?.createdBy || (detail.userID ? String(detail.userID) : undefined),
            dateCreated: current?.dateCreated || new Date(),
        }
        if(list.range) definition.range = list.range
        if(valueType === 'none') definition.color = singleColor(detail)

        // Replaced in place, so the tag keeps its spot in the list
        org.tagDefinitions = org.tagDefinitions.map(d => d === current ? definition : d)
        await org.save()

        if(memberUpdates.length){
            await Membership.bulkWrite(memberUpdates.map(m => ({updateOne: {filter: {_id: m._id}, update: {$set: {tags: m.tags}}}})), {ordered: false})
        }
        for(var update of groupUpdates){
            update.group.queries = update.queries
            update.group.markModified('queries')
            await update.group.save()
        }
        // A hidden tag stays hidden in its activities under the new name
        if(newLabel !== label){
            await Activity.updateMany({orgIDs: detail.orgID, tagsToHide: label}, {$set: {'tagsToHide.$[hidden]': newLabel}}, {arrayFilters: [{hidden: label}]})
        }

        return {success: true, definition: definition, label: newLabel, membersUpdated: memberUpdates.length, groupsUpdated: groupUpdates.length}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateTagDefinition, valueChanges, updatedMemberTags, updatedQueries}
