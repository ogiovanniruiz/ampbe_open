var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const submitTextSurveyResponse = async(details) => {
    try {

        var textContactHistory = await ActivityContactRecord.findById(details.textContactRecord._id);
        textContactHistory.surveyResponse = details.surveyResponse
        textContactHistory.complete = true;

        return textContactHistory.save();

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitTextSurveyResponse}
