var phonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')
var submitOutreachEntry= require('../activity/submitOutreachEntry')
var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')
var lockHouseHold = require('../phonebank/lockHouseHold')

const submitPhoneNonResponse = async(details) => {
    try {

        var pbContactHistory = await PhonebankContactHistory.find({'person.resident.personID': details.personID, 
                                                                      activityID: details.activity._id,
                                                                      userID: details.user._id,
                                                                      pass: details.activity.passes
                                                                    }).sort({$natural:-1}).limit(1)

        pbContactHistory[0].nonResponse = {contactedBy: details.userID, nonResponse: details.nonResponse, nonResponseType: details.nonResponseType, nonResponseSetID: details.nonResponseSetID}           
        pbContactHistory[0].complete = true;
        pbContactHistory[0].save();


        const { _id, ...pbContactHistoryEntry } = pbContactHistory[0]._doc;
        pbContactHistoryEntry.activityType = await details.activity.activityType;
        pbContactHistoryEntry.scriptID = await details.activity.scriptID;
        pbContactHistoryEntry.user = await details.user;

        var houseHoldID = {}

        if(details.activity.idByHousehold === 'HOUSEHOLD' || details.activity.idByHousehold === 'INDIVIDUAL'){
            houseHoldID = {
                streetNum: details.houseHoldID.streetNum,
                prefix: details.houseHoldID.prefix,
                street: details.houseHoldID.street,
                suffix: details.houseHoldID.suffix,
                unit: details.houseHoldID.unit,
                city: details.houseHoldID.city,
                state: details.houseHoldID.state,
                zip: details.houseHoldID.zip,
            }
        }else{
            houseHoldID = {
                address: details.houseHoldID.address,
                city: details.houseHoldID.city,
                state: details.houseHoldID.state,
                zip: details.houseHoldID.zip,
            }

            pbContactHistoryEntry.member = true
        }

        submitOutreachEntry.submitOutreachEntry(pbContactHistoryEntry)

        var pbHHRecord = await phonebankHouseHoldRecord.findOne({'houseHold._id': houseHoldID, activityID: details.activity._id});

        pbHHRecord.numResContacted = pbHHRecord.numResContacted + 1;
        
        if(details.nonResponseType == "DNC" || details.nonResponseType === "INVALIDPHONE"){
            pbHHRecord.residentStatus.push("COMPLETE");
        }

        if(pbHHRecord.numResContacted >= details.hhSize || pbHHRecord.residentStatus.length >= details.hhSize){
            pbHHRecord.passed = true;
            if(details.nonResponseType == "DNC" || details.nonResponseType === "INVALIDPHONE"){
                pbHHRecord.complete = true;
            }
        } 

        await pbHHRecord.save()
        return lockHouseHold.lockHouseHold(pbContactHistory[0])
        

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitPhoneNonResponse}
