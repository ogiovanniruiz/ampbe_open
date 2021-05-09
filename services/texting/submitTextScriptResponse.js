var submitOutreachEntry= require('../activity/submitOutreachEntry')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const submitTextScriptResponse = async(details) => {
    try {

        var textContactHistory = await TextbankContactHistory.findById(details.textContactRecord._id);
        textContactHistory.scriptResponse = {contactedBy: details.textContactRecord.userID, questionResponses: details.idResponses};
        textContactHistory.complete = true;
        await textContactHistory.save();


        const { _id, ...textContactHistoryEntry } = textContactHistory._doc;
        textContactHistoryEntry.activityType = await details.activity.activityType;
        textContactHistoryEntry.scriptID = await details.activity.scriptID;
        textContactHistoryEntry.user = await details.user;

        if(details.activity.idByHousehold === 'MEMBERSHIP'){
            textContactHistoryEntry.member = true;
        }

        submitOutreachEntry.submitOutreachEntry(textContactHistoryEntry)
        
        return textContactHistory

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitTextScriptResponse}
