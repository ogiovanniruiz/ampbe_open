var People = require('../../models/people/people');
var Campaign = require('../../models/campaigns/campaign')
var Districts = require('../../models/campaigns/districts')

// Election dates each "registered by" count is measured against
const ELECTION_DATES = {
    General: {2025: "2025-11-02", 2024: "2024-11-05", 2022: "2022-11-07", 2020: "2020-11-07", 2018: "2018-11-07", 2016: "2016-11-08"},
    Primary: {2025: "2025-11-02", 2024: "2024-06-07", 2022: "2022-06-07", 2020: "2020-03-04", 2018: "2018-06-06", 2016: "2016-06-07"},
}
const YEARS = ['2025', '2024', '2022', '2020', '2018', '2016']
const PARTIES = {numDems: 'DEM', numReps: 'REP', numNPP: 'NPP', numMPL: 'MPL', numMPC: 'MPC'}
const COUNT_FIELDS = ['totalVoters', ...Object.keys(PARTIES), ...YEARS.map(y => 'numReg' + y), ...YEARS.map(y => 'numVoted' + y)]

// Voter-file counts change rarely: keep results for 12 hours per server process
const CACHE_TTL_MS = 12 * 60 * 60 * 1000
const CACHE_MAX_ENTRIES = 500
const cache = new Map()

const cacheGet = (key) => {
    const entry = cache.get(key)
    if(!entry) return null
    if(Date.now() - entry.computedAt > CACHE_TTL_MS){
        cache.delete(key)
        return null
    }
    return entry
}

const cacheSet = (key, row, computedAt) => {
    if(cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value)
    cache.set(key, {row, computedAt})
}

/**
 * One aggregation that counts every district in `districtIDs` at once, grouped by district.
 * Counts are defined exactly as before: party, registered before each election date,
 * and voted in each year's election (the campaign's election type; 2025 is the Special).
 */
const countDistricts = async(districtField, districtIDs, electionType) => {
    const dates = ELECTION_DATES[electionType] || {}

    // "Voted in <year>" means a voted entry for that year with the campaign's election type (2025: the Special)
    const votedKey = (year) => year + '|' + (year === '2025' ? 'Special' : electionType)

    const groupStage = {_id: '$' + districtField, totalVoters: {$sum: 1}}
    Object.entries(PARTIES).forEach(([field, party]) => {
        groupStage[field] = {$sum: {$cond: [{$eq: ['$party', party]}, 1, 0]}}
    })
    YEARS.forEach(year => {
        // Same comparison as before; a missing reg date compares as earlier than any date
        groupStage['numReg' + year] = dates[year]
            ? {$sum: {$cond: [{$lt: ['$regDate', new Date(dates[year])]}, 1, 0]}}
            : {$sum: 0}
        groupStage['numVoted' + year] = {$sum: {$cond: [{$in: [votedKey(year), '$votedKeys']}, 1, 0]}}
    })

    const agg = [
        {$match: {[districtField]: {$in: districtIDs}}},
        // Carry only what's counted through the rest of the pipeline
        {$project: {
            _id: 0,
            district: '$' + districtField,
            party: '$resident.party',
            regDate: {$arrayElemAt: ['$resident.regDates', 0]},
            // One pass: keep voted entries as "year|type" keys, then each year is a cheap $in.
            // Benchmarked ~1.7x faster than one $filter per year, with identical counts.
            votedKeys: {$map: {
                // String fields only: $concat would fail on anything else, and the old $eq checks never matched it
                input: {$filter: {input: {$ifNull: ['$resident.voteHistory', []]}, as: 'entry', cond: {$and: [
                    {$eq: ['$$entry.voted', true]},
                    {$eq: [{$type: '$$entry.year'}, 'string']},
                    {$eq: [{$type: '$$entry.electionType'}, 'string']},
                ]}}},
                as: 'entry',
                in: {$concat: ['$$entry.year', '|', '$$entry.electionType']},
            }},
        }},
        {$group: {...groupStage, _id: '$district'}},
    ]

    return People.aggregate(agg).allowDiskUse(true)
}

const emptyCounts = () => Object.fromEntries(COUNT_FIELDS.map(field => [field, 0]))

const sumRows = (rows) => {
    const total = emptyCounts()
    rows.forEach(row => COUNT_FIELDS.forEach(field => total[field] += row[field] || 0))
    return total
}

/**
 * detail: {campaignID, districtID?, refresh?}
 *   districtID omitted -> the campaign's first district (fast default view)
 *   districtID 'ALL'   -> every district, plus a combined total
 */
const getDistrictDataSummary = async(detail) => {

    const campaign = await Campaign.findOne({campaignID: detail.campaignID}, {boundaryIDs: 1, electionType: 1})
    if(!campaign) return {districtList: [], districts: [], total: null}

    const boundary = await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs || []}}, {properties: 1})
        .sort({'properties.name': 1})
    if(!boundary.length) return {districtList: [], districts: [], total: null}

    const districtType = boundary[0].properties.districtType
    const districtField = 'districts.' + districtType.toLowerCase() + 'ID'
    const districtList = boundary.map(b => ({id: b.properties.identifier, name: b.properties.name || b.properties.identifier}))
    const electionType = campaign.electionType

    const selected = detail.districtID === 'ALL' ? 'ALL'
        : (districtList.find(d => d.id === detail.districtID) ? detail.districtID : districtList[0].id)
    const wanted = selected === 'ALL' ? districtList : districtList.filter(d => d.id === selected)

    const keyFor = (id) => [detail.campaignID, electionType, id].join('|')

    // Use cached districts where possible; count only the rest, in one pass
    const rowsByID = new Map()
    let oldestComputedAt = Date.now()
    let allCached = true

    if(!detail.refresh){
        wanted.forEach(d => {
            const hit = cacheGet(keyFor(d.id))
            if(hit){
                rowsByID.set(d.id, hit.row)
                oldestComputedAt = Math.min(oldestComputedAt, hit.computedAt)
            }
        })
    }

    const missing = wanted.filter(d => !rowsByID.has(d.id))
    if(missing.length){
        allCached = false
        const computedAt = Date.now()
        const counted = await countDistricts(districtField, missing.map(d => d.id), electionType)
        const countedByID = new Map(counted.map(row => [row._id, row]))

        missing.forEach(d => {
            // A district with no voters still gets a zero row
            const row = {...emptyCounts(), ...(countedByID.get(d.id) || {})}
            delete row._id
            rowsByID.set(d.id, row)
            cacheSet(keyFor(d.id), row, computedAt)
        })
        if(rowsByID.size === missing.length) oldestComputedAt = computedAt
    }

    const districts = wanted.map(d => ({id: d.id, name: d.name, ...rowsByID.get(d.id)}))

    return {
        districtType,
        electionType,
        districtList,
        selected,
        districts,
        total: sumRows(districts),
        computedAt: new Date(oldestComputedAt),
        cached: allCached,
    }
}

module.exports = {getDistrictDataSummary}
