var Activity = require('../../models/activities/activity')
var User = require('../../models/users/user')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const webpush = require('web-push');

const receiveText = async(incoming) =>{
    try{

        var residentPhonenum = incoming.From.substring(2);
        var message = incoming.Body;
        var userPhonenum = incoming.To;

        console.log("Text Received.", )
        console.log(residentPhonenum)
        console.log(message)
        console.log(userPhonenum)

        var activity = await Activity.findOne({active: true, 
                                               activityType: "Texting", 
                                               'textMetaData.activityPhonenums.number': userPhonenum
                                            })
        var date = new Date();

        if(!activity){ 
            return
        }

        var textContactHistory = await TextbankContactHistory.find({   activityID: activity._id,
                                                                       residentPhonenum: residentPhonenum,
                                                                       userPhonenum: userPhonenum,
                                                                       
                                                                    }).sort({$natural:-1}).limit(1)

        if(textContactHistory.length > 0){
            console.log("Found the resident ID.")
        }else{
            console.log("NOT FOUND")
        }

        textContactHistory[0].textReceived = {status: true, date: date}
        textContactHistory[0].textConvo.push({origin: 'PERSON', msg: message})
        textContactHistory[0].save()
        

        var tbHouseHoldRecord = await TextbankHouseHoldRecord.findOne({
                                                                       activityID: activity._id,
                                                                      'houseHold.residents.personID': textContactHistory[0].personID
                                                                      })

        if(tbHouseHoldRecord){
            console.log("Found the HH Record.")
        }else{
            console.log("NOT FOUND")
        }

        tbHouseHoldRecord.numResContacted = tbHouseHoldRecord.numResContacted + 1;

        if(activity.idByHousehold === 'HOUSEHOLD'){
            tbHouseHoldRecord.textReceived = true;
        } else {
            if(tbHouseHoldRecord.numResContacted === tbHouseHoldRecord.houseHold.residents.length){
                tbHouseHoldRecord.textReceived = true;
            }
        }


        tbHouseHoldRecord.save()
        
        var user = await User.findById(textContactHistory[0].userID)

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

            webpush.sendNotification(user.swSub, JSON.stringify(notificationPayload)).catch(err => {throw new Error(err)});
        }

        

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}


module.exports = {receiveText}
