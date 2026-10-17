const Activity = require('../../models/activities/activity')
const User = require('../../models/users/user')
const ActivityContactRecord = require('../../models/activities/activityContactRecord')
const OrphanedText = require('../../models/activities/textbank/orphanedText')
const webpush = require('web-push');
const CallPool = require('../../models/organizations/callPool')

const receiveTwilioText = async(incoming) =>{
    try{

        let residentPhonenumber = incoming.From.substring(2);
        let message = incoming.Body;
        let userPhonenumber = incoming.To;

        let callPool = await CallPool.findOne({ 'number': incoming.To})

        let activities = await Activity.find({active: true, orgIDs: callPool.orgID, activityType: 'Phonebank'})

        let activityIDS = activities.map(activity => String(activity._id))

        // Most recent call to this number, so the reply is tied to the latest outreach
        let phonebankContactRecord = await ActivityContactRecord.findOne({ activityID: { $in: activityIDS },
                                                                            activityType: "Phonebank",
                                                                           'phonebankContactDetails.residentPhonenumber': incoming.From
                                                                        }).sort({creationDate: -1})

        if(!phonebankContactRecord){
            console.log("No phonebank contact record found for incoming text from: ", incoming.From, " to: ", incoming.To)
            var orphanedText = new OrphanedText(incoming)
            await orphanedText.save()
            return
        }

        // Continue the latest conversation with this person, if there is one
        let textContactRecord = await ActivityContactRecord.findOne({activityID: { $in: activityIDS },
                                                                     activityType: "Texting",
                                                                    'textbankContactDetails.residentPhonenumber': residentPhonenumber,
                                                                    'textbankContactDetails.userPhonenumber': userPhonenumber}).sort({creationDate: -1})

        if(!textContactRecord){
            let activity = await Activity.findOne({_id: phonebankContactRecord.activityID})
            if(!activity.textMetaData){
                console.log("No text meta data found for activity with ID: ", phonebankContactRecord.activityID)
                var orphanedText = new OrphanedText(incoming)
                await orphanedText.save()
                return
            }
            
            // New conversation record. Only identifying fields are taken from the call record, so the
            // call record (and its survey response or nonresponse) is left untouched. userPhonenumber
            // is the number the person texted, which is what the next reply will be matched on.
            textContactRecord = new ActivityContactRecord({
                personID: phonebankContactRecord.personID,
                person: phonebankContactRecord.person,
                userID: phonebankContactRecord.userID,
                user: phonebankContactRecord.user,
                activityID: phonebankContactRecord.activityID,
                orgID: phonebankContactRecord.orgID,
                campaignID: phonebankContactRecord.campaignID,
                activityHouseholdRecordID: phonebankContactRecord.activityHouseholdRecordID,
                activityType: 'Texting',
                textbankContactDetails: {residentPhonenumber: residentPhonenumber, userPhonenumber: userPhonenumber, textConvo: []},
            })
        }

        textContactRecord.textbankContactDetails.textReceived = {status: true, date: new Date()}
        textContactRecord.textbankContactDetails.textConvo.push({origin: 'PERSON', msg: message})
        await textContactRecord.save()


    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {receiveTwilioText}