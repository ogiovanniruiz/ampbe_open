var Membership = require('../../models/people/membership')
var {asList, asObjectIds, normalizePhone} = require('./memberUtils')
var {mergeMemberTags} = require('./memberTags')

// Fields that move together: a member's address only makes sense with its own location and districts
const ADDRESS_FIELDS = ['address', 'fullAddress1', 'fullAddress2', 'accuracyType', 'location', 'county', 'districts', 'registrationPrecinctID']

// Resident fields that are combined (phones, emails) or identify the member (ids) rather than filled
const RESIDENT_SKIP = ['_id', 'personID', 'name', 'phones', 'emails']

const isEmpty = (value) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

const memberDate = (member) => new Date(member.enrollment?.dateCreated || 0).getTime()

// Groups that share a member become one merge, so a member found by both phone and email is merged once
const connectedGroups = (groups, memberByID) => {
    var parent = new Map()
    const find = (id) => {
        while(parent.get(id) !== id){
            parent.set(id, parent.get(parent.get(id)))
            id = parent.get(id)
        }
        return id
    }
    var keepIDs = []

    for(var group of asList(groups)){
        var ids = asList(group.memberIDs).map(String).filter(id => memberByID.has(id))
        ids.forEach(id => { if(!parent.has(id)) parent.set(id, id) })
        for(var i = 1; i < ids.length; i++) parent.set(find(ids[i]), find(ids[0]))
        if(group.keepID && memberByID.has(String(group.keepID))) keepIDs.push(String(group.keepID))
    }

    var components = new Map()
    for(var id of parent.keys()){
        var root = find(id)
        if(!components.has(root)) components.set(root, [])
        components.get(root).push(memberByID.get(id))
    }

    return [...components.values()].filter(members => members.length > 1).map(members => {
        var ids = new Set(members.map(m => String(m._id)))
        var keepID = keepIDs.find(id => ids.has(id))
        var oldest = [...members].sort((a, b) => memberDate(a) - memberDate(b))[0]
        return {keep: keepID ? memberByID.get(keepID) : oldest, members: members}
    })
}

// The kept member's values win; empty ones are filled from the others (newest first) and lists are combined
const combine = (keep, others) => {
    var donors = [...others].sort((a, b) => memberDate(b) - memberDate(a))
    var all = [keep, ...donors]
    var resident = {...(keep.resident || {})}

    var name = {...(resident.name || {})}
    for(var donor of donors){
        for(var [field, value] of Object.entries(donor.resident?.name || {})){
            if(isEmpty(name[field]) && !isEmpty(value)) name[field] = value
        }
    }
    resident.name = name

    for(var donor of donors){
        for(var [field, value] of Object.entries(donor.resident || {})){
            if(RESIDENT_SKIP.includes(field)) continue
            if(isEmpty(resident[field]) && !isEmpty(value)) resident[field] = value
        }
    }

    var phoneNumbers = new Set()
    resident.phones = all.flatMap(m => m.resident?.phones || []).filter(phone => {
        var number = normalizePhone(phone?.number)
        if(!number || phoneNumbers.has(number)) return false
        phoneNumbers.add(number)
        return true
    })

    var emailKeys = new Set()
    resident.emails = all.flatMap(m => m.resident?.emails || []).filter(email => {
        var key = String(email || '').trim().toLowerCase()
        if(!key || emailKeys.has(key)) return false
        emailKeys.add(key)
        return true
    })

    var update = {resident: resident}

    if(isEmpty(String(keep.fullAddress1 || '').trim())){
        var addressDonor = donors.find(m => !isEmpty(String(m.fullAddress1 || '').trim()))
        if(addressDonor) ADDRESS_FIELDS.forEach(field => { if(addressDonor[field] !== undefined) update[field] = addressDonor[field] })
    }

    const union = (field) => [...new Set(all.flatMap(m => m[field] || []))]
    var mergedPersonIDs = new Set([
        ...(keep.mergedPersonIDs || []),
        ...donors.flatMap(m => [m.resident?.personID, ...(m.mergedPersonIDs || [])]),
    ].filter(id => !isEmpty(id) && id !== resident.personID))

    // One entry per tag; the kept member's value wins, then the newest other member's
    update.tags = [...all].reverse().reduce((tags, m) => mergeMemberTags(tags, m.tags), [])
    update.activityIDs = union('activityIDs')
    update.mergedPersonIDs = [...mergedPersonIDs]
    update.isRegisteredVoter = all.some(m => m.isRegisteredVoter)
    var dates = all.map(memberDate).filter(t => t > 0)
    if(dates.length) update['enrollment.dateCreated'] = new Date(Math.min(...dates))

    // The kept member's source stays; one with none takes the oldest other member's
    if(!keep.enrollment?.source){
        var sourced = [...donors].reverse().find(m => m.enrollment?.source)
        if(sourced){
            update['enrollment.source'] = sourced.enrollment.source
            if(sourced.enrollment.sourceID) update['enrollment.sourceID'] = sourced.enrollment.sourceID
            if(sourced.enrollment.createdBy && !keep.enrollment?.createdBy) update['enrollment.createdBy'] = sourced.enrollment.createdBy
        }
    }

    // Consent survives if any merged member gave it; keep the most recent date it was given
    for(var field of ['optinTexting', 'optinEmail']){
        var consented = all.filter(m => m.enrollment?.[field]?.status)
        if(!consented.length) continue
        var latest = Math.max(...consented.map(m => new Date(m.enrollment[field].dateUpdated || 0).getTime()))
        update[`enrollment.${field}`] = {status: true, dateUpdated: latest > 0 ? new Date(latest) : new Date()}
    }

    return update
}

// Merges each group of the org's members into one member: the chosen keepID, or the oldest member.
// Contact records are left as they are; the merged personIDs are kept on the member so its history follows.
const mergeMembers = async(detail) => {
    try {
        var ids = asObjectIds(asList(detail.groups).flatMap(group => asList(group.memberIDs)))
        if(!detail.orgID || !ids.length) return {success: false, msg: "Select at least one group to merge."}

        var members = await Membership.find({'enrollment.orgID': detail.orgID, _id: {$in: ids}}).lean()
        var memberByID = new Map(members.map(m => [String(m._id), m]))

        var merges = connectedGroups(detail.groups, memberByID)
        if(!merges.length) return {success: false, msg: "Nothing to merge: each group needs at least two members."}

        var removed = 0
        for(var merge of merges){
            var others = merge.members.filter(m => String(m._id) !== String(merge.keep._id))
            await Membership.updateOne({_id: merge.keep._id, 'enrollment.orgID': detail.orgID}, {$set: combine(merge.keep, others)})
            var deleted = await Membership.deleteMany({'enrollment.orgID': detail.orgID, _id: {$in: others.map(m => m._id)}})
            removed += deleted.deletedCount
        }

        return {success: true, merged: merges.length, removed: removed}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {mergeMembers}
