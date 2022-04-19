var Activity = require('../../models/activities/activity')
var CanvassHouseHoldRecord = require('../../models/activities/canvass/canvassHouseHoldRecord')
var CanvassContactHistory = require('../../models/activities/canvass/canvassContactHistory')
var submitOutreachEntry= require('../activity/submitOutreachEntry')
var People = require('../../models/people/people')

const submitCanvassScriptResponse = async(details) => {
    try { 

        //console.log(details)

        var canvassContactHistory = new CanvassContactHistory({personID: details.personID, 
                                                                 userID: details.user._id, 
                                                                 orgID: details.orgID,
                                                                 campaignID: details.activity.campaignID,
                                                                 activityID: details.activity._id,
                                                                 userName: details.user.name,
                                                                 scriptResponse: {contactedBy: details.user._id, questionResponses: details.idResponses},       
                                                                 complete: true
                                                               })
                                                
        var person = await People.findOne({'resident.personID': details.personID})

        canvassContactHistory.person = person
        canvassContactHistory.save()

        const { _id, ...cContactHistoryEntry } = canvassContactHistory._doc;
        cContactHistoryEntry.activityType = await details.activity.activityType;
        cContactHistoryEntry.scriptID = await details.activity.scriptID;
        cContactHistoryEntry.user = await details.user;
                                                    
        var houseHoldID = {}
                                            
        if(details.activity.idByHousehold === 'HOUSEHOLD' || details.activity.idByHousehold === 'INDIVIDUAL'){

            console.log(details.houseHoldID)
                                            
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

        var cHHRecord = await CanvassHouseHoldRecord.findOne({'houseHold._id': houseHoldID, activityID: details.activity._id});

        //cHHRecord.residentStatus.push("COMPLETE");
        cHHRecord.numResContacted = cHHRecord.numResContacted + 1;

        if(details.activity.idByHousehold === 'HOUSEHOLD'){
            cHHRecord.passed = true;
            cHHRecord.complete = true;
        }else{
            if(cHHRecord.numResContacted >= details.hhSize){ //|| cHHRecord.residentStatus.length >= details.hhSize){
                cHHRecord.passed = true;
                cHHRecord.complete = true;
            }
        }

        return await cHHRecord.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitCanvassScriptResponse}