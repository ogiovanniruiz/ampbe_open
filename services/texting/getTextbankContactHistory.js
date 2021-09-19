var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const getTextbankContactHistory = async(data) => {
    try { 

        var lockedHouseHoldRecords = await TextbankHouseHoldRecord.find({lockedBy: data.userID, 
                                                                         activityID: data.activityID,
                                                                         initTextSent: false,
                                                                         textReceived: false,
                                                                        })
        
        var lockedResidents = lockedHouseHoldRecords.filter(x=> {return x['houseHold']['residents'].length > 1})
                                                    .map(x => {return x['houseHold']['residents']})
                                                    .flat()
                                                    .map(x=> {return x['personID']})
                                                    
        var textbankContactHistory = await TextbankContactHistory.find({activityID: data.activityID, userID: data.userID,  personID: {$in: lockedResidents}})
        var residentsSent = textbankContactHistory.map(x =>{return x['personID']});
        
        var residentsResponded = await TextbankContactHistory.find({activityID: data.activityID, 
                                                                    userID: data.userID, 
                                                                    complete: false, 
                                                                    'textReceived.status': true })
        
                                                        
        return {residentsSent: residentsSent, residentsResponded: residentsResponded}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTextbankContactHistory}
