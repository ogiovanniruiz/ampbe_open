const Activity = require('../../models/activities/activity')
const User = require('../../models/users/user')
const ActivityContactRecord = require('../../models/activities/activityContactRecord')
const OrphanedText = require('../../models/activities/textbank/orphanedText')
const webpush = require('web-push');

const receiveSWText = async(incoming) =>{
    try{

        let residentPhonenumber = incoming.From.substring(2);
        let message = incoming.Body;
        let userPhonenumber = incoming.To;

        let activity = await Activity.findOne({active: true, 'textMetaData.activityPhonenumber': userPhonenumber})

        if(!activity){
            console.log("No active activity found for userPhonenumber: ", userPhonenumber)
            let orphanedText = new OrphanedText(incoming)
            await orphanedText.save()
            return
        }

        // Newest first: after a reset the same person can have a conversation per pass
        let textContactRecord = await ActivityContactRecord.findOne({activityID: activity._id,
                                                                     'textbankContactDetails.residentPhonenumber': residentPhonenumber,
                                                                     'textbankContactDetails.userPhonenumber': userPhonenumber})
                                                           .sort({creationDate: -1})
        
        if(!textContactRecord){
            console.log("No text contact record found for residentPhonenumber: ", residentPhonenumber, " and userPhonenumber: ", userPhonenumber)
            let orphanedText = new OrphanedText(incoming)
            await orphanedText.save()
            return
        }

        textContactRecord.textbankContactDetails.textReceived = {status: true, date: new Date()}
        textContactRecord.textbankContactDetails.textConvo.push({origin: 'PERSON', msg: message})

        await textContactRecord.save()

        let user = await User.findById(textContactRecord.userID)

        if(user.swSub){
            const notificationPayload = {
                "notification": {
                    "title": "Amplify Notification",
                    "body": "Text Message received!",
                    "vibrate": [100, 50, 100],
                    "data": {
                        "dateOfArrival": Date.now(),
                        "primaryKey": 1
                        }
                }
            };

            webpush.sendNotification(user.swSub, JSON.stringify(notificationPayload)).catch(err => {
                console.log(err)
            });
        }

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {receiveSWText}