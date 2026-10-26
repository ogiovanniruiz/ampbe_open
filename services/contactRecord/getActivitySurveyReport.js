var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')

const getActivitySurveyReport = async(detail) => {
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
            {$unwind: "$surveyResponse.questionResponses"},
            {$match: {'surveyResponse.questionResponses.question': detail.question}},
            {$group: {_id: {userID: "$userID", 
                            question: "$surveyResponse.questionResponses.question",
                            response: "$surveyResponse.questionResponses.response"},
                      count: {$sum: 1}        
            }},
            {$group: {_id: {
                      userID: "$_id.userID",
                      question: "$_id.question"},
                    responses: {
                    $push: {
                      response: "$_id.response",
                      count: "$count"
                    }
                  }
                }
              },
                {
                $group: {
                    _id: "$_id.userID",
                    questions: {
                      $push: {
                        question: "$_id.question",
                        responses: "$responses"
                      }
                    }
                  }
                }])

    if(results.length === 0){
      return []
    }

    var userIDs = results.map(x => {return String(x._id)})
    var users = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})

    var data_object_array = []

    results.map(result => {

      var data_object = {}
      data_object['User'] = users.find(user => user._id.toString() === result._id.toString()).name.fullName
          
      result.questions.forEach(question => {
        question.responses.forEach(response => {
            let key = response.response;
            data_object[key] = response.count;
        });
      });

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

module.exports = {getActivitySurveyReport}