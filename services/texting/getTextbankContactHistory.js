var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var { getFinishedTextPersonIDs } = require('./textEligibility')

const getTextbankContactHistory = async(data) => {
    try {
        var lockedHouseHoldRecords = await ActivityHouseholdRecord.find({lockedBy: data.userID, 
                                                                        activityID: data.activityID,
                                                                        passed: false,
                                                                        complete: false})

        var allLockedPersonIDs = lockedHouseHoldRecords.map(x => x['household']['residents'])
                                                       .flat()
                                                       .map(x => x['personID'])

        var lockedResidentPersonIDs = lockedHouseHoldRecords.filter(x=> {return x['household']['residents'].length > 1})
                                                    .map(x => {return x['household']['residents']})
                                                    .flat()
                                                    .map(x=> {return x['personID']})

        // "Sent" only means sent during the current pass
        var sentQuery = {activityID: data.activityID, userID: data.userID,  personID: {$in: lockedResidentPersonIDs}}
        if(data.pass !== undefined && data.pass !== null) sentQuery.pass = data.pass

        var [textbankContactHistory, residentsFinished, residentsResponded] = await Promise.all([
            ActivityContactRecord.find(sentQuery),
            // Replied or finished in any pass: these people are not texted again
            getFinishedTextPersonIDs(data.activityID, allLockedPersonIDs),
            ActivityContactRecord.find({activityID: data.activityID, 
                                        complete: false, 
                                        'textbankContactDetails.textReceived.status': true
                                       }),
        ])

        var residentsSentPersonIDs = textbankContactHistory.map(x =>{return x['personID']});

        return {residentsSent: residentsSentPersonIDs, residentsResponded: residentsResponded, residentsFinished: residentsFinished}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTextbankContactHistory}
