var Organization = require('../../models/organizations/organization')
var {isConsentTag} = require('./consent')

// Member tags are [{label, value}]: one entry per label, value empty for plain tags.
// Colors live on org.tagDefinitions, never on the member.

const TAG = 'tags.label'

const key = (label) => String(label || '').trim().toUpperCase()

// Strings or {label, value} -> {tags: [{label, value?}], texting, email}. Trimmed, one entry per label
// (the last one wins), and the old consent tags pulled out as consent.
const toMemberTags = (input) => {
    var byLabel = new Map(), texting = false, email = false
    for(var item of Array.isArray(input) ? input : []){
        var label = String((typeof item === 'string' ? item : item?.label) || '').trim()
        if(!label) continue
        if(isConsentTag(label, 'texting')){ texting = true; continue }
        if(isConsentTag(label, 'email')){ email = true; continue }
        var value = typeof item === 'string' ? '' : String(item?.value ?? '').trim()
        byLabel.set(key(label), value ? {label, value} : {label})
    }
    return {tags: [...byLabel.values()], texting, email}
}

// Labels and values checked against the org: labels take the org's spelling, and a value must be one the
// label's definition offers. strict: a bad value is an error ({msg}); otherwise it's dropped. Returns {tags} or {msg}.
const checkTagValues = async(orgID, tags, {strict = false} = {}) => {
    // One list holds every tag; plain tags have no values
    var org = await Organization.findOne({_id: orgID}, {tagDefinitions: 1}).lean()
    var definitions = new Map((org?.tagDefinitions || []).map(d => [key(d.label), d]))
    var spellings = new Map((org?.tagDefinitions || []).map(d => [key(d.label), d.label]))

    var checked = []
    for(var tag of tags){
        var definition = definitions.get(key(tag.label))
        var label = definition?.label || spellings.get(key(tag.label)) || tag.label
        var value = tag.value
        if(value){
            var offered = (definition?.values || []).find(v => key(v.value) === key(value))
            if(!offered){
                if(strict) return {msg: definition?.values?.length ? `"${value}" isn't one of the values for ${label}.` : `${label} doesn't have values.`}
                value = ''
            } else {
                value = offered.value
            }
        }
        checked.push(value ? {label, value} : {label})
    }
    return {tags: checked}
}

// Both lists combined by label; incoming values win (an incoming tag without a value keeps the existing value)
const mergeMemberTags = (existing, incoming) => {
    var byLabel = new Map()
    for(var tag of toMemberTags(existing).tags) byLabel.set(key(tag.label), tag)
    for(var tag of toMemberTags(incoming).tags){
        var current = byLabel.get(key(tag.label))
        byLabel.set(key(tag.label), tag.value || !current ? tag : current)
    }
    return [...byLabel.values()]
}

// Pipeline update: drop any entry with this label, then add {label, value}, in one write
const setTagPipeline = (label, value) => {
    var tag = value ? {label, value} : {label}
    return [{$set: {tags: {$concatArrays: [
        {$filter: {input: {$ifNull: ['$tags', []]}, cond: {$ne: [{$toUpper: '$$this.label'}, key(label)]}}},
        [{$literal: tag}],
    ]}}}]
}

// Members with this tag and one of these values; '' means the tag with no value
const tagValueClause = (label, values) => {
    var list = (Array.isArray(values) ? values : []).map(v => v === null || v === undefined ? '' : String(v))
    var real = list.filter(v => v !== '')
    var options = []
    if(real.length) options.push({value: {$in: real}})
    if(list.includes('')) options.push({value: {$exists: false}}, {value: ''}, {value: null})
    return {tags: {$elemMatch: {label, $or: options}}}
}

const hasTag = (member, label) => (member?.tags || []).some(tag => key(tag?.label ?? tag) === key(label))

module.exports = {TAG, toMemberTags, checkTagValues, mergeMemberTags, setTagPipeline, tagValueClause, hasTag}
