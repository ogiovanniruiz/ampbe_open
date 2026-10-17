var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const getPhonebankNotes = async(detail) => {
    try { 
        
        var personIDs = detail.household.residents.map(resident =>{return resident.personID})
        return await ActivityContactRecord.aggregate([{$match: {campaignID: detail.campaignID, 
                                                                orgID: detail.orgID,
                                                                personID: {$in: personIDs},
                                                                surveyResponse: {$exists: true},
                                                                'surveyResponse.questionResponses.questionType': "NOTES"
                                                }}, {$unwind: "$surveyResponse.questionResponses"},
                                                {$match: {'surveyResponse.questionResponses.questionType': "NOTES"}},
                                                {$project: {name: "$person.resident.name",
                                                            personID: "$person.resident.personID", 
                                                            question: '$surveyResponse.questionResponses.question',
                                                            response: '$surveyResponse.questionResponses.response'
                                                        }},
                                                {$group: {
                                                    _id: "$name",
                                                    questionResponses: {$push: {personID: "$personID", question: "$question", response: "$response"}}
                                                }},
                                            ])

    } catch(e){
        throw new Error(e.message)    
    }
}

module.exports = {getPhonebankNotes}
