var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var GetSingularTextingReport = require('./getSingularTextingReport')

const getPhonebankReport = async(detail) => {
    try {
    let match = {activityID: detail.activityID}

    if (detail.startDate && !detail.endDate) {
        match.creationDate = {'$gte': new Date(detail.startDate)};
    }
    if (!detail.startDate && detail.endDate) {
        match.creationDate = {'$lte': new Date(detail.endDate)};
    }
    if (detail.startDate && detail.endDate) {
        match.creationDate = {'$gte': new Date(detail.startDate), '$lte': new Date(detail.endDate)};
    }

    var phonebankResults = await ActivityContactRecord.aggregate([
        {$match: match},
        {
          $group: {
            _id: "$userID",
            uniqueCalls: { $addToSet: "$personID" },
            surveyResponse: {'$push':'$surveyResponse'},
            calls: {'$push': '$phonebankContactDetails'},
            status: {'$push': '$phonebankContactDetails.status'},
            lengthOfCall: {'$push': '$phonebankContactDetails.lengthOfCall'},
          }
        },
        {'$project': {
            '_id': 1,
            'called': {'$size': '$calls'},
            'uniqueCalls': {'$size': '$uniqueCalls'},
            'surveyResponse': {$size: '$surveyResponse'},
            'successful': {
                '$size': {
                    '$filter': {
                        'input': '$status',
                        'cond': {
                            '$eq': ['$$this', 'completed']
                        }
                    }
                }
            },
            'avgCallLength': {
                '$trunc':[{
                    '$avg':'$lengthOfCall'
                },4]
            }
          },
        }

        ])

        if(phonebankResults.length === 0){return []}

        var activity = await Activity.findOne({_id: detail.activityID}, {enableTexting: 1})
        
        if(activity.enableTexting){
            var textingResults = await GetSingularTextingReport.getSingularTextingReport(match)
        }

        var userIDs = phonebankResults.map(x => {return String(x._id)})
        var users = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})

        var data_object_array = []

        phonebankResults.map(result => {

            var data_object = {}
            data_object['User'] = users.find(user => user._id.toString() === result._id.toString()).name.fullName

            data_object['Call Attempts'] = result.called
            data_object['Dial Tone Heard'] = result.successful
            data_object['Unique Calls'] = result.uniqueCalls

            data_object['Contacts'] = result.surveyResponse
            data_object['Contacts/Unique Calls'] = Math.round((result.surveyResponse/result.uniqueCalls)*100, 2) + "%"


            data_object['Avg Call Length(s)'] = Math.round(result.avgCallLength)

            if(activity.enableTexting){
                if(textingResults.find(textingResult => textingResult._id.toString() === result._id.toString())){
                    data_object['Texts Sent'] = textingResults.find(textingResult => textingResult._id.toString() === result._id.toString()).textSent

                }else{
                    data_object['Texts Sent'] = 0
                }
            }
            data_object_array.push(data_object)
        });

        data_object_array.sort((a, b) => {
            if (a.User.toLowerCase() < b.User.toLowerCase()) {
                return -1;
            }
            if (a.User.toLowerCase() > b.User.toLowerCase()) {
                return 1;
            }
            return 0;
        });
    
        return data_object_array
  
      } catch(e){
        throw new Error(e.message)
      }


}

module.exports = {getPhonebankReport}