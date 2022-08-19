var OutreachReport = require('../../models/campaigns/outreachReport')
var Activity = require('../../models/activities/activity')
var pbcontacthistory = require('../../models/activities/phonebank/phonebankContactHistory')
var ccontacthistory = require('../../models/activities/canvass/canvassContactHistory')
var tbcontacthistory = require('../../models/activities/textbank/textbankContactHistory')

const downloadNotes = async(detail) => {
    try {

        console.log(detail)

        var scriptIDs = [detail.scripts._id] //.map(x => x._id)

        const agg = [
            {
                '$match': {
                    'scriptResponse': {$exists: true},
                    //'campaignID': detail.campaignID,
                    'scriptID': {$in: scriptIDs},
                    'scriptResponse.questionResponses.idType': "NONE"
                }
            },
            { $unwind : "$scriptResponse.questionResponses" },  
            { $match: {'scriptResponse.questionResponses.idType': "NONE",
                    'scriptResponse.questionResponses.response': {$regex: '@'},
        
        }
    
    },
            
            {
                $project: {
                    firstName: '$person.resident.name.firstName',
                    lastName: '$person.resident.name.lastName',
                    question: '$scriptResponse.questionResponses.question',
                    response: '$scriptResponse.questionResponses.response',
                    scriptID: '$scriptID'

                }
            }
        ];

        return await OutreachReport.aggregate(agg).allowDiskUse(true);

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadNotes}
