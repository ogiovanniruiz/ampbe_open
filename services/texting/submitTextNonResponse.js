var submitOutreachEntry = require('../activity/submitOutreachEntry')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const submitTextNonResponse = async(details) => {

    try {
        var textContactHistory = await TextbankContactHistory.findById(details.textContactRecord._id)
        textContactHistory.nonResponse = {contactedBy: details.textContactRecord.userID, nonResponse: details.nonResponse, nonResponseType: details.nonResponseType, nonResponseSetID: details.nonResponseSetID}
        textContactHistory.complete = true;
        await textContactHistory.save();

        const { _id, ...textContactHistoryEntry } = textContactHistory._doc;
        textContactHistoryEntry.activityType = await details.activity.activityType;
        textContactHistoryEntry.scriptID = await details.activity.scriptID;
        textContactHistoryEntry.user = await details.user;

        if(details.activity.idByHousehold === 'MEMBERSHIP'){
            textContactHistoryEntry.member = true;
        }

        submitOutreachEntry.submitOutreachEntry(textContactHistoryEntry);

        return textContactHistory
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitTextNonResponse}
