var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')

const getTextbankReport = async(detail) => {
    try{
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
        {
          $group: {
            _id: "$userID",
            textSent: {'$push': '$textbankContactDetails.textSuccessful'},
            // Texts Delivered: hidden until it's ready to show; uncomment to turn on
            // textDelivered: {'$sum': {'$cond': [{'$eq': ['$textbankContactDetails.deliveryStatus', 'delivered']}, 1, 0]}},
            textResponded: {'$push': '$textbankContactDetails.textReceived'}
          }
        },

        {'$project': {
         '_id': 1,
          'textSent': {
              '$size': '$textSent'
          },
          // Texts Delivered: hidden until it's ready to show; uncomment to turn on
          // 'textDelivered': 1,
          'textResponded': {
            '$size': {
                '$filter': {
                    'input': '$textResponded',
                    'cond': {
                        '$eq': [
                            '$$this.status', true
                        ]
                    }
                }
            }
        }
          },
        }

    ])

    if(results.length === 0){return []}

    var userIDs = results.map(x => {return String(x._id)})
    var users = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})
    
    var data_object_array = []
        
    results.map(result => {

        var data_object = {}
        data_object['User'] = users.find(user => user._id.toString() === result._id.toString()).name.fullName
        data_object['Texts Sent'] = result.textSent
        // Texts Delivered: hidden until it's ready to show; uncomment to turn on
        // data_object['Texts Delivered'] = result.textDelivered
        data_object['Texts Responded'] = result.textResponded
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

module.exports = {getTextbankReport}