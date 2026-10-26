var ActivityContactRecord = require('../../models/activities/activityContactRecord');
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var GetSingularTextingReport = require('./getSingularTextingReport')

const getPetitionReport = async(detail) => {
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

    var results = await ActivityContactRecord.aggregate([
      // Signatures only; texts sent from the petition are Texting records on the same activity
      {$match: {...match, activityType: 'Petition'}},
        {
            $group: {
              _id: "$userID",
              count: { $sum: 1 }
            }
        }
    ])

    var activity = await Activity.findOne({_id: detail.activityID}, {enableTexting: 1})
    
    if(activity.enableTexting){
      var textingResults = await GetSingularTextingReport.getSingularTextingReport(match)
    }

    if(results.length === 0){return []}

    var userIDs = results.map(x => {return String(x._id)})
    var users = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})

    var data_object_array = []

    results.map(result => {

      var data_object = {}

      data_object['User'] = users.find(user => user._id.toString() === result._id.toString()).name.fullName
      data_object['Contacts'] = result.count
            
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

module.exports = {getPetitionReport}