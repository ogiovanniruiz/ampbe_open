var Activity = require('../../models/activities/activity')
var GetSWCampaignPhonenumbers = require('../organization/signalWire/getSWCampaignPhonenumbers')
var GetHotlineStatus = require('../hotline/getHotlineStatus')
const getAvailableTextingNumbers = async(data) => {
    try { 

        //GETS PHONE NUMBERS FROM SIGNALWIRE CAMPAIGN USING API
        const swCampaignPhonenumbers = await GetSWCampaignPhonenumbers.getSWCampaignPhonenumbers(data)

        //CHECKS FOR SIGNALWIRE CAMPAIGN PHONE NUMBERS THAT HAVE BEEN PROCESSED
        const completedSWCampaignPhonenumbers = swCampaignPhonenumbers.filter(phonenumber => {return phonenumber.state === 'completed'})
                                                                      .map(phonenumber => {return phonenumber.phone_number.number})
        
        //CHECKS IF NUMBERS ARE ALLOCATED TO USERS OR ACTIVITY IN ANY ACTIVE ACTIVITY
        const activeActivities = await Activity.find({active: true, textMetaData: {$exists: true}, $or: [{enableTexting: true}, {activityType: "Texting"}] })

        const allocatedActivityNumbers = activeActivities.map(activity => {
            return activity.textMetaData.activityPhonenumber
        })

        const availableNumbers = completedSWCampaignPhonenumbers.filter(number => !allocatedActivityNumbers.includes(number));

        //FILTERS OUT NUMBERS THAT ARE USED BY THE RAPID RESPONSE HOTLINE
        const hotlineNumberCallPool = await GetHotlineStatus.getHotlineStatus(data)

        if(hotlineNumberCallPool){
            const hotlineNumber = hotlineNumberCallPool.number
            return availableNumbers.filter(availableNumber => availableNumber !== hotlineNumber);
        }

        return availableNumbers

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAvailableTextingNumbers}