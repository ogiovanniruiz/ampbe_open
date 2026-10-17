var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const submitTextNonResponse = async(details) => {

    try {

        var textContactHistory = await ActivityContactRecord.findById(details.textContactRecord._id);
        textContactHistory.nonResponse = details.nonResponseObject
        textContactHistory.complete = true;

        return textContactHistory.save();

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitTextNonResponse}
