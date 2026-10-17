var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign');
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Lookup = require('./swPhoneLookup')
var Activity = require('../../models/activities/activity')
var { getFinishedTextPersonIDs } = require('./textEligibility')
const { RestClient } = require("@signalwire/compatibility-api");
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL

const sendInitText = async(incomingTextbankContactHistory) => {
    try { 

        // Never send another initial text to someone who replied or was finished in an earlier pass
        var alreadyFinished = await getFinishedTextPersonIDs(incomingTextbankContactHistory.activityID, [incomingTextbankContactHistory.personID])
        if(alreadyFinished.length){
            return {skipped: true, personID: incomingTextbankContactHistory.personID}
        }

        var orgID = incomingTextbankContactHistory.orgID;

        var campaign = await Campaign.findOne({campaignID:  incomingTextbankContactHistory.campaignID})

        if(campaign.textingFundedByCreatorOrg){
            orgID = campaign.creatorOrg 
        }
  
        var org = await Organization.findOne({'_id': orgID})
      
        if(!org.signalWireAccount) return false
        if(!org.signalWireAccount.accountID) return false
      
        var accountID = org.signalWireAccount.accountID

        const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });

        var record = await Lookup.swPhoneLookup(incomingTextbankContactHistory)

        var activity = await Activity.findOne({_id: incomingTextbankContactHistory.activityID})

        
        if(record.deviceType === 'mobile'){

            var outGoingMessage = {
                from: incomingTextbankContactHistory.textbankContactDetails.userPhonenumber,
                to: '+1' + incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber,
            }
     
            if(incomingTextbankContactHistory.textbankContactDetails.initTextMessage  && incomingTextbankContactHistory.textbankContactDetails.initTextMessage != ''){
                outGoingMessage.body = incomingTextbankContactHistory.textbankContactDetails.initTextMessage
            }
     
            if(incomingTextbankContactHistory.textbankContactDetails.imageUrl){
                outGoingMessage.mediaUrl = incomingTextbankContactHistory.textbankContactDetails.imageUrl
            }
     
            await client.messages.create(outGoingMessage).then(message => {return message}).catch(error => {return error});
            
            
        }

        var newTextContactHistory = new ActivityContactRecord(incomingTextbankContactHistory)
        newTextContactHistory.textbankContactDetails.textSuccessful = true

        
        await newTextContactHistory.save()

        var tbHHRecord = await ActivityHouseholdRecord.findById(incomingTextbankContactHistory.activityHouseholdRecordID)

        var hhPersonIDs = tbHHRecord.household.residents.map(x=> {return x.personID})

        // A resident is done for this pass when texted this pass, or finished in any pass
        var [textedThisPass, finished] = await Promise.all([
            ActivityContactRecord.distinct('person.resident.personID', {'person.resident.personID': {$in: hhPersonIDs},
                                                                        'textbankContactDetails.textSuccessful': true,
                                                                        pass: incomingTextbankContactHistory.pass,
                                                                        activityID: activity._id}),
            getFinishedTextPersonIDs(activity._id, hhPersonIDs),
        ])
        var numResContacted = new Set([...textedThisPass, ...finished]).size

        if(activity.idBy === 'HOUSEHOLD'){
            tbHHRecord.passed = true;
            tbHHRecord.timesContacted = tbHHRecord.timesContacted + 1
            await tbHHRecord.save()
            return {textContactRecord: newTextContactHistory, textbankHouseholdRecord: tbHHRecord}
        }
         
        if(numResContacted >= hhPersonIDs.length){
            tbHHRecord.passed = true;
            tbHHRecord.timesContacted = tbHHRecord.timesContacted + 1
            await tbHHRecord.save()
            return {textContactRecord: newTextContactHistory, textbankHouseholdRecord: tbHHRecord}
        }
        
        return {textContactRecord: newTextContactHistory, textbankHouseholdRecord: tbHHRecord}

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendInitText}
