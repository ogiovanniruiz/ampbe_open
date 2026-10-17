var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')
const getActivityNonresponseSetReport = async(detail) => {
    try { 
        var match = {activityID: detail.activityID}

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
           
            {$match: match},
            {$group: 
                {_id: 
                    {userID: "$userID", nonResponse: "$nonResponse.nonResponse",
                    },
                count: {$sum: 1}        
                }
            },
            {$group: {
                _id: "$_id.userID",
                nonResponses: {
                    $push: {nonResponse: "$_id.nonResponse", count: "$count"}
                }
                }
              }

            ])

    if(results.length === 0){
        return []
    }

    var userIDs = results.map(x => {return String(x._id)})
    var users = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})
    
    var data_object_array = []

    results.map(result => {

      var data_object = {}
      
      data_object['User'] = users.find(user => user._id.toString() === result._id.toString()).name.fullName

      result.nonResponses.forEach(nonResponse =>{
        if(nonResponse.nonResponse){
            let key = nonResponse.nonResponse
            data_object[key] = nonResponse.count
        }
      })
      
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

module.exports = {getActivityNonresponseSetReport}