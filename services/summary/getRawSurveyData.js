var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Organizations = require('../../models/organizations/organization')
var Campaigns = require('../../models/campaigns/campaign')
var Activity = require('../../models/activities/activity')

const getRawSurveyData = async(detail) => {

    var baseMatch = {campaignID: detail.campaignID}

    if (detail.startDate && !detail.endDate) {
        baseMatch.creationDate = {'$gte': new Date(detail.startDate)};
    }

    if (!detail.startDate && detail.endDate) {
        baseMatch.creationDate = {'$lte': new Date(detail.endDate)};
    }

    if (detail.startDate && detail.endDate) {
        baseMatch.creationDate = {'$gte': new Date(detail.startDate), '$lte': new Date(detail.endDate)};
    }

    var campaign = await Campaigns.findOne({campaignID: detail.campaignID})

    var orgs = await Organizations.find({_id: {$in: campaign.orgIDs}})

    if(detail.orgID && detail.summaryType != "Organization" && campaign.creatorOrg !== detail.orgID) {baseMatch.orgID = detail.orgID}

    var match = {...baseMatch, 'surveyResponse.surveyID': detail.surveyID}

    // Only pull the fields used below; the embedded person/user docs are large
    var projection = {
        orgID: 1, activityType: 1, creationDate: 1, surveyResponse: 1, nonResponse: 1,
        'person.resident.personID': 1, 'person.resident.name': 1, 'person.resident.emails': 1, 'person.resident.phones': 1,
        'person.resident.ethnicity': 1, 'person.resident.age': 1, 'person.resident.party': 1,
        'person.resident.ampID': 1, 'person.resident.voterID': 1, 'person.resident.pdiID': 1, 'person.resident.pdiid': 1,
        'person.address': 1, 'person.county': 1, 'person.registrationPrecinctID': 1,
        'user.name.fullName': 1
    }

    if(detail.fields.includes("voteHistory")) projection['person.resident.voteHistory'] = 1

    let dataQuery = [{$match: match}]

    if(detail.mode === "NOTES"){
        dataQuery.push({$unwind: "$surveyResponse.questionResponses"})
        dataQuery.push({$match: {'surveyResponse.questionResponses.questionType': detail.mode}})
    }

    dataQuery.push({$project: projection})

    let results = await ActivityContactRecord.aggregate(dataQuery).allowDiskUse(true)

    // Non-responses come after survey responses so the personID dedup below keeps a person's survey response
    if(detail.includeNonResponses && detail.mode !== "NOTES"){
        var activities = await Activity.find({surveyID: detail.surveyID, campaignID: detail.campaignID}, {_id: 1})
        var activityIDs = activities.map(activity => activity._id.toString())

        var nonResponseResults = await ActivityContactRecord.aggregate([
            {$match: {...baseMatch, activityID: {$in: activityIDs}, nonResponse: {$exists: true}}},
            {$project: projection}
        ]).allowDiskUse(true)
        results = results.concat(nonResponseResults)
    }

    if(results.length === 0){ return [] }

    var orgNames = new Map(orgs.map(org => [org._id.toString(), org.name]))

    var seenPersonIDs = new Set()

    var data_object_array = []

    results.forEach(result => {

        var personID = result.person.resident.personID

        if(seenPersonIDs.has(personID)) return

        seenPersonIDs.add(personID)

        var data_object = {}

        if(detail.fields.includes("firstName")) data_object['firstName'] = result.person.resident.name.firstName

        if(detail.fields.includes("middleName")) data_object['middleName'] = result.person.resident.name.middleName

        if(detail.fields.includes("lastName")) data_object['lastName'] = result.person.resident.name.lastName

        if(detail.fields.includes("org")) data_object['Organization'] = orgNames.get(result.orgID.toString()) || ""

        if(detail.fields.includes("activityType")) data_object['activityType'] = result.activityType

        if(detail.fields.includes("email")) data_object['email'] = result.person.resident.emails[0] ? result.person.resident.emails[0] : ""

        if(detail.fields.includes("phone")) data_object['phone'] = result.person.resident.phones[0]?.number ? result.person.resident.phones[0]?.number : ""

        if(detail.fields.includes("ethnicity")) data_object['ethnicity'] = result.person.resident.ethnicity
        
        if(detail.fields.includes("age")) data_object['age'] = result.person.resident.age ? result.person.resident.age : ""
        
        if(detail.fields.includes("party")) data_object['party'] = result.person.resident.party

        if(detail.fields.includes("address")) data_object['address'] = formatStreetAddress(result.person.address)

        if(detail.fields.includes("city")) data_object['city'] = result.person.address.city
    
        if(detail.fields.includes("zip")) data_object['zip'] = result.person.address.zip

        if(detail.fields.includes("county")) data_object['county'] = result.person.county

        if(detail.fields.includes("precinct")) data_object['Precinct'] = result.person.registrationPrecinctID
        
        if(detail.fields.includes("creationDate")) data_object['creationDate(GMT)'] = result.creationDate
        
        if(detail.mode === "NOTES"){
            var cleaned_question = result.surveyResponse.questionResponses.question.replace(/,/g, "")
            data_object[cleaned_question] = result.surveyResponse.questionResponses.response
        }else if(result.surveyResponse){
            result.surveyResponse.questionResponses.forEach(questionResponse => {

                if(questionResponse.questionType === "MULTISELECT"){

                    var cleaned_question = questionResponse.question.replace(/,/g, "")
                    var cleaned_response = questionResponse.response.replace(/,/g, "")
                    
                    if(!data_object[cleaned_question]){
                        data_object[cleaned_question] = [];
                    }
                    data_object[cleaned_question].push(cleaned_response)

                }else{

                    var cleaned_question = questionResponse.question.replace(/,/g, "")
                    data_object[cleaned_question] = questionResponse.response

                }  
            });
        }


        if(detail.includeNonResponses){
            data_object['nonResponse'] = result.nonResponse ? result.nonResponse.nonResponse : ""
            data_object['nonResponseType'] = result.nonResponse ? result.nonResponse.nonResponseType : ""
        }

        if(detail.fields.includes("User")) data_object['User'] = result.user?.name?.fullName || ""
        if(detail.fields.includes("ampID")) data_object['ampID'] = result.person.resident.ampID
        if(detail.fields.includes("voterID")) data_object['voterID'] = result.person.resident.voterID ? result.person.resident.voterID : ""
        if(detail.fields.includes("pdiID")) data_object['pdiid'] = result.person.resident.pdiID || result.person.resident.pdiid || ""

        if(detail.fields.includes("voteHistory")) {
            for (var i in result.person.resident.voteHistory) {
                var cleaned_vote = `${result.person.resident.voteHistory[i]['year']} ${result.person.resident.voteHistory[i]['electionType']}`.replace(/,/g, "")
                data_object[cleaned_vote] = result.person.resident.voteHistory[i]['voted']
            }
        }

        data_object['personID'] = personID

        data_object_array.push(data_object);

    });

    return data_object_array


}

// "123 N Main St 4B": number before prefix, missing parts left out instead of printing "undefined"
const formatStreetAddress = (address) => {
    if(!address) return ""
    return [address.streetNum, address.prefix, address.street, address.suffix, address.unit]
        .filter(part => part !== undefined && part !== null && String(part).trim() !== "")
        .map(part => String(part).trim())
        .join(" ")
}

module.exports = {getRawSurveyData}