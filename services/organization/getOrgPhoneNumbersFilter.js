var Activity = require('../../models/activities/activity')

const getOrgPhoneNumbersFilter = async(data) => {
    try {

        const agg = [
            {
                '$match': {
                    //'campaignID': data.campaignID,
                    'active': true
                }
            },// REMOVED BECAUSE WE WANT TO PREVENT AN ORG FROM USING SAME NUM ACCROSS MULTIPLE CAMPAIGNS 8/27/20
            {
                '$unwind': {
                    'path': '$textMetaData.activityPhonenums'
                }
            }, {
                '$match': {
                    'textMetaData.activityPhonenums.number': {
                        '$in': data.numbers
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'filteredNums': {
                        '$push': '$$ROOT.textMetaData.activityPhonenums.number'
                    }
                }
            }
        ];
        var numbers = await Activity.aggregate(agg);
        console.log(numbers)
        return numbers;
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgPhoneNumbersFilter}
