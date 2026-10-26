var People = require('../../models/people/people');
var Campaign = require('../../models/campaigns/campaign');
var Districts = require('../../models/campaigns/districts');

// Campaign voter search: what the results list shows, and how many to return
// (one over the display cap, so the client knows there are more)
const CAMPAIGN_SEARCH_FIELDS = {
    'resident.name': 1, 'resident.party': 1, 'resident.age': 1, 'resident.voterID': 1, 'resident.personID': 1,
    'resident.phones': 1, 'resident.emails': 1, 'resident.gender': 1, 'resident.dob': 1, 'resident.ethnicity': 1,
    'resident.spanish_probable': 1, 'resident.generalPropensity': 1, 'resident.primaryPropensity': 1,
    'resident.specialPropensity': 1, 'resident.voteHistory': 1, 'resident.regDates': 1, 'resident.pav': 1,
    'resident.voted_current_cycle': 1,
    address: 1, location: 1, fullAddress1: 1, fullAddress2: 1, districts: 1, registrationPrecinctID: 1, county: 1
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

const text = (value) => typeof value === 'string' ? value.trim() : (typeof value === 'number' ? String(value) : '')

// Campaign voter search. Returns null unless it has an anchor (last name, street with city or ZIP,
// voter ID, phone or email): first name, party, age, city or ZIP alone match too many voters.
const campaignSearchQuery = (person) => {
    var query = {}
    var firstName = text(person.firstName).toUpperCase()
    var lastName = text(person.lastName).toUpperCase()
    var streetNum = text(person.streetNum).toUpperCase()
    var streetName = text(person.streetName).toUpperCase()
    var city = text(person.city).toUpperCase()
    var zip = text(person.zip)
    var voterID = text(person.voterID)
    // Phones are stored as 10 digits
    var phone = text(person.phone).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
    var email = text(person.email).toLowerCase()

    if(firstName) query['resident.name.firstName'] = firstName
    if(lastName) query['resident.name.lastName'] = lastName
    if(streetNum) query['address.streetNum'] = streetNum
    if(streetName) query['address.street'] = streetName
    if(city) query['address.city'] = city
    if(zip) query['address.zip'] = zip
    if(voterID) query['resident.voterID'] = voterID
    if(phone) query['resident.phones.number'] = phone
    if(email) query['resident.emails'] = email

    var party = text(person.party).toUpperCase()
    if(party) query['resident.party'] = party

    var ageMin = parseInt(person.ageMin), ageMax = parseInt(person.ageMax)
    if(!isNaN(ageMin) || !isNaN(ageMax)){
        query['resident.age'] = {}
        if(!isNaN(ageMin)) query['resident.age'].$gte = ageMin
        if(!isNaN(ageMax)) query['resident.age'].$lte = ageMax
    }

    var anchored = lastName || (streetName && (city || zip)) || voterID || phone || email
    return anchored ? query : null
}

const getPerson = async(person) => {

    var query = {}
    if(person.firstName) query['resident.name.firstName'] = person.firstName
    if(person.lastName) query['resident.name.lastName'] = person.lastName

    if(person.streetNum) query['address.streetNum'] = person.streetNum
    if(person.streetName) query['address.street'] = person.streetName

    if(person.city) query['address.city'] = person.city
    if(person.zip) query['address.zip'] = person.zip

    // Older callers (People page) send no campaignID and keep the original unscoped search.
    // Campaign 0 is real, and a missing campaign is sent as null; both stay scoped.
    if(!('campaignID' in person)) return await People.find(query)

    var campaignQuery = campaignSearchQuery(person)
    if(!campaignQuery) return []

    var districtFilter = await campaignDistrictFilter(person.campaignID)
    if(!districtFilter) return []

    return await People.find({...campaignQuery, ...districtFilter}, CAMPAIGN_SEARCH_FIELDS)
        .sort({'resident.name.lastName': 1, 'resident.name.firstName': 1})
        .limit(CAMPAIGN_SEARCH_LIMIT)
}

module.exports = {getPerson}
