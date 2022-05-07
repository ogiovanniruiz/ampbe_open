var CanvassHouseHoldRecord = require('../../models/activities/canvass/canvassHouseHoldRecord')
var CanvassContactHistory = require('../../models/activities/canvass/canvassContactHistory')
var submitOutreachEntry= require('../activity/submitOutreachEntry')
var People = require('../../models/people/people')

const submitCanvassNonResponse = async(details) => {
    try {

        var canvassContactHistory = new CanvassContactHistory({personID: details.personID, 
                                                               userID: details.user._id, 
                                                               orgID: details.orgID,
                                                               campaignID: details.activity.campaignID,
                                                               activityID: details.activity._id,
                                                               userName: details.user.name,
                                                               nonResponse: {contactedBy: details.userID, 
                                                                            nonResponse: details.nonResponse, 
                                                                            nonResponseType: details.nonResponseType, 
                                                                            nonResponseSetID: details.nonResponseSetID} ,    
                                                            })

        var person = await People.findOne({'resident.personID': details.personID})

        canvassContactHistory.person = person

        if(details.nonResponseType == "DNC" || details.nonResponseType === "INVALIDADDRESS"){
            canvassContactHistory.complete = true
        }

        canvassContactHistory.save()

        const { _id, ...cContactHistoryEntry } = canvassContactHistory._doc;
        cContactHistoryEntry.activityType = await details.activity.activityType;
        cContactHistoryEntry.scriptID = await details.activity.scriptID;
        cContactHistoryEntry.user = await details.user;

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

            cContactHistoryEntry.member = true
        }

        submitOutreachEntry.submitOutreachEntry(cContactHistoryEntry)

        var ccHHRecord = await CanvassHouseHoldRecord.findOne({'houseHold._id': houseHoldID, activityID: details.activity._id});

        ccHHRecord.numResContacted = ccHHRecord.numResContacted + 1;

        if(details.activity.idByHousehold === 'HOUSEHOLD'){
            ccHHRecord.passed = true;
        }else{
            if(ccHHRecord.numResContacted >= details.hhSize){ //|| ccHHRecord.residentStatus.length >= details.hhSize){
                ccHHRecord.passed = true;
            } 
        }
        
        if(details.nonResponseType == "DNC" || details.nonResponseType === "INVALIDADDRESS"){
            ccHHRecord.complete = true;
        }

        return await ccHHRecord.save()

    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitCanvassNonResponse}