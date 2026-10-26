var mongoose = require('mongoose');
var Membership = require('../../models/people/membership')
var Organization = require('../../models/organizations/organization')
var {TEXTING_OPTIN, EMAIL_OPTIN} = require('./consent')
var {ensureTag} = require('../organization/tags/orgTags')

const { ObjectId } = mongoose.Types;

// US numbers as 10 digits, without formatting or a leading country code
const normalizePhone = (value) => {
    var digits = String(value || '').replace(/\D/g, '')
    return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const asList = (value) => Array.isArray(value) ? value.filter(x => x !== null && x !== undefined && x !== '') : []

// Valid ObjectIds only, so a bad id from the client can't throw a cast error
const asObjectIds = (ids) => asList(ids).filter(id => ObjectId.isValid(id)).map(id => new ObjectId(String(id)))

// Returns the org's spelling of a tag, adding the tag to the organization when it's new.
// Returns {tag, created} or null when the org doesn't exist (or for a consent tag: consent is a member flag).
const ensureOrgTag = (orgID, rawTag) => ensureTag(orgID, rawTag)

// A non-empty first phone / email. ($type rather than null checks: a numeric path like
// phones.0.number also reads a missing "0" field on every element, which counts as null.)
const HAS_PHONE = {'resident.phones.0.number': {$type: 'string', $ne: ''}}
const HAS_EMAIL = {'resident.emails.0': {$type: 'string', $ne: ''}}

// Consent (member.enrollment) only counts when there's somewhere to reach them
const TEXTABLE = {...TEXTING_OPTIN, ...HAS_PHONE}
const EMAILABLE = {...EMAIL_OPTIN, ...HAS_EMAIL}
const NO_CONTACT = {$nor: [HAS_PHONE, HAS_EMAIL]}

// Identifies one duplicate group; a new member joining the group changes it, so a dismissed group shows again
const groupSignature = (reason, memberIDs) => `${reason}|${memberIDs.map(String).sort().join(',')}`

// A member by personID, including members whose personID was merged into them
const personIDQuery = (personID) => ({$or: [{'resident.personID': personID}, {mergedPersonIDs: personID}]})

// Ids of members that share a phone, an email, or a name and address with another member of the org,
// leaving out groups the org marked as not duplicates
const findDuplicateGroups = async(orgID) => {
    var org = await Organization.findOne({_id: orgID}, {dismissedDuplicates: 1}).lean()
    var dismissed = new Set(org?.dismissedDuplicates || [])

    var members = await Membership.find({'enrollment.orgID': orgID},
        {'resident.name': 1, 'resident.phones': 1, 'resident.emails': 1, fullAddress1: 1, tags: 1, activityIDs: 1, enrollment: 1}).lean()

    var keyers = [
        {reason: 'Same phone', key: m => normalizePhone(m.resident?.phones?.[0]?.number)},
        {reason: 'Same email', key: m => String(m.resident?.emails?.[0] || '').trim().toLowerCase()},
        {reason: 'Same name and address', key: m => {
            var first = String(m.resident?.name?.firstName || '').trim().toUpperCase()
            var last = String(m.resident?.name?.lastName || '').trim().toUpperCase()
            var address = String(m.fullAddress1 || '').trim().toUpperCase()
            return first && last && address ? `${first} ${last} · ${address}` : ''
        }},
    ]

    var groups = []
    for(var keyer of keyers){
        var buckets = new Map()
        for(var member of members){
            var key = keyer.key(member)
            if(!key) continue
            if(!buckets.has(key)) buckets.set(key, [])
            buckets.get(key).push(member)
        }
        for(var [key, bucket] of buckets){
            if(bucket.length < 2) continue
            var signature = groupSignature(keyer.reason, bucket.map(m => m._id))
            if(!dismissed.has(signature)) groups.push({key: key, reason: keyer.reason, signature: signature, members: bucket})
        }
    }
    return groups
}

const findDuplicateIDs = async(orgID) => {
    var groups = await findDuplicateGroups(orgID)
    var ids = new Set()
    groups.forEach(group => group.members.forEach(m => ids.add(String(m._id))))
    return [...ids].map(id => new ObjectId(id))
}

module.exports = {normalizePhone, escapeRegex, asList, asObjectIds, ensureOrgTag, TEXTABLE, EMAILABLE, NO_CONTACT, findDuplicateGroups, findDuplicateIDs, groupSignature, personIDQuery}
