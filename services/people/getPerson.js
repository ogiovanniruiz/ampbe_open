var People = require('../../models/people/people');
var Campaign = require('../../models/campaigns/campaign');
var Districts = require('../../models/campaigns/districts');

// Campaign voter search: what the results list shows, and how many to return
// (one over the display cap, so the client knows there are more)
const CAMPAIGN_SEARCH_FIELDS = {
    'resident.name': 1, 'resident.party': 1, 'resident.age': 1, 'resident.voterID': 1, 'resident.personID': 1,
    address: 1, location: 1, fullAddress1: 1, fullAddress2: 1
}
const CAMPAIGN_SEARCH_LIMIT = 51

// Same district rule groups use (services/group/groupUtils.js buildBaseFilter)
const campaignDistrictFilter = async(campaignID) => {
    var campaign = await Campaign.findOne({campaignID: campaignID}, {boundaryIDs: 1})
    if(!campaign?.boundaryIDs?.length) return null

    var boundary = await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs}}, {properties: 1})
    if(!boundary.length) return null

    var districtTypeParam = 'districts.' + boundary[0].properties.districtType.toLowerCase() + 'ID'
    return {[districtTypeParam]: {$in: boundary.map(b => b.properties.identifier)}}
}

const getPerson = async(person) => {

    var query = {}
    if(person.firstName) query['resident.name.firstName'] = person.firstName
    if(person.lastName) query['resident.name.lastName'] = person.lastName

    if(person.streetNum) query['address.streetNum'] = person.streetNum
    if(person.streetName) query['address.street'] = person.streetName

    if(person.city) query['address.city'] = person.city
    if(person.zip) query['address.zip'] = person.zip

    // Older callers (People page) keep the original unscoped search
    if(!person.campaignID) return await People.find(query)

    // Never search the whole voter file by name alone
    if(!person.lastName) return []

    var districtFilter = await campaignDistrictFilter(person.campaignID)
    if(!districtFilter) return []

    return await People.find({...query, ...districtFilter}, CAMPAIGN_SEARCH_FIELDS)
        .sort({'resident.name.lastName': 1, 'resident.name.firstName': 1})
        .limit(CAMPAIGN_SEARCH_LIMIT)
}

module.exports = {getPerson}
