var Membership = require('../../models/people/membership')
var {normalizePhone, escapeRegex, asList, TEXTABLE, EMAILABLE, NO_CONTACT, findDuplicateIDs} = require('./memberUtils')
var {sourceQuery} = require('./memberFields')
var {tagValueClause} = require('./memberTags')

const FILTERS = {
    textable: () => TEXTABLE,
    emailable: () => EMAILABLE,
    voter: () => ({isRegisteredVoter: true}),
    nonVoter: () => ({isRegisteredVoter: {$ne: true}}),
    noContact: () => NO_CONTACT,
    invalidNumber: () => ({'resident.invalidnumber': true}),
    notGeocoded: () => ({geocoded: {$ne: true}}),
    duplicate: async(orgID) => ({_id: {$in: await findDuplicateIDs(orgID)}}),
}

const SUMMARY_FILTERS = ['textable', 'emailable', 'voter', 'noContact', 'invalidNumber', 'notGeocoded']

const searchClause = (search) => {
    var text = String(search || '').trim()
    if(!text) return null

    var words = text.split(/\s+/).map(escapeRegex)
    var nameClauses = words.map(word => ({$or: [
        {'resident.name.firstName': {$regex: word, $options: 'i'}},
        {'resident.name.lastName': {$regex: word, $options: 'i'}},
    ]}))

    var or = [{$and: nameClauses}, {'resident.emails': {$regex: escapeRegex(text), $options: 'i'}}]

    // Phones are stored in mixed formats, so match the digits with anything between them
    var digits = normalizePhone(text)
    if(digits.length >= 3 && /^[\d\s()+.-]+$/.test(text)){
        or.push({'resident.phones.number': {$regex: digits.split('').join('\\D*')}})
    }
    return {$or: or}
}

// One paged query behind every list on the Membership page.
// Summary counts ignore the filters so they can act as filter toggles.
const getMembers = async(detail) => {
    try {
        var source = detail.source || {type: 'all'}
        var base = {'enrollment.orgID': detail.orgID, ...sourceQuery(source.type, source.id)}

        var search = searchClause(detail.search)
        if(search) base = {$and: [base, search]}

        var filters = asList(detail.filters).filter(name => FILTERS[name])
        var filterClauses = await Promise.all(filters.map(name => FILTERS[name](detail.orgID)))

        // In a tag's list: only members with the chosen values of that tag ('' = no value)
        var tagValues = source.type === 'tag' && Array.isArray(detail.tagValues) ? detail.tagValues.map(v => v === null || v === undefined ? '' : String(v)) : []
        if(tagValues.length) filterClauses.push(tagValueClause(source.id, tagValues))

        var pageSize = Math.min(Math.max(parseInt(detail.pageSize) || 10, 1), 100)
        var page = Math.max(parseInt(detail.page) || 0, 0)

        var filterMatch = {$match: filterClauses.length ? {$and: filterClauses} : {}}
        var membersPipeline = [{$match: base}, filterMatch, {$sort: {'enrollment.dateCreated': -1, _id: -1}}]
        if(!detail.all) membersPipeline.push({$skip: page * pageSize}, {$limit: pageSize})

        var summary = {total: [{$count: 'n'}]}
        SUMMARY_FILTERS.forEach(name => summary[name] = [{$match: FILTERS[name]()}, {$count: 'n'}])

        // Members run outside the $facet so a full export isn't capped by the 16MB document limit
        var members = await Membership.aggregate(membersPipeline).allowDiskUse(true)
        var [result] = await Membership.aggregate([
            {$match: base},
            {$facet: {
                filteredTotal: [filterMatch, {$count: 'n'}],
                ...summary,
                // Members per value of the open tag, ignoring the filters like the summary
                ...(source.type === 'tag' ? {valueCounts: [
                    {$unwind: '$tags'},
                    {$match: {'tags.label': source.id}},
                    {$group: {_id: {$ifNull: ['$tags.value', '']}, n: {$sum: 1}}},
                ]} : {}),
            }}
        ]).allowDiskUse(true)

        var count = (facet) => facet?.[0]?.n || 0

        var summaryCounts = {}
        Object.keys(summary).forEach(name => summaryCounts[name] = count(result[name]))

        var valueCounts = {}
        for(var row of result.valueCounts || []) valueCounts[row._id] = (valueCounts[row._id] || 0) + row.n

        return {members: members, total: count(result.filteredTotal), summary: summaryCounts, valueCounts: valueCounts}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMembers}
