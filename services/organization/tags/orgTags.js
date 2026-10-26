var Organization = require('../../../models/organizations/organization')
var {isConsentTag} = require('../../membership/consent')

// org.tagDefinitions is the org's one tag list. Every tag has an entry; a plain tag is
// {label, valueType: 'none', values: []} with no color. Every org tag read and write goes through here.

const key = (text) => String(text ?? '').trim().toUpperCase()

const tagList = (org) => org?.tagDefinitions || []

const tagLabels = (org) => tagList(org).map(tag => tag.label)

const findTag = (org, label) => tagList(org).find(tag => key(tag.label) === key(label))

// Has values or a color (what the client calls a definition), as opposed to a plain tag
const isStyled = (tag) => !!(tag?.values?.length || tag?.color)

const plainTag = (label, userID) => {
    var tag = {label: label, valueType: 'none', values: [], dateCreated: new Date()}
    if(userID) tag.createdBy = String(userID)
    return tag
}

// The org's spelling of a tag, adding it as a plain tag when it's new.
// Returns {tag, created}, or null for a missing org, an empty name or a consent tag.
const ensureTag = async(orgID, rawLabel, userID) => {
    var label = String(rawLabel || '').trim()
    if(!label || isConsentTag(label, 'texting') || isConsentTag(label, 'email')) return null

    var org = await Organization.findOne({_id: orgID}, {tagDefinitions: 1}).lean()
    if(!org) return null

    var existing = findTag(org, label)
    if(existing) return {tag: existing.label, created: false}

    await Organization.updateOne({_id: orgID}, {$push: {tagDefinitions: plainTag(label, userID)}})
    return {tag: label, created: true}
}

module.exports = {tagList, tagLabels, findTag, isStyled, plainTag, ensureTag}
