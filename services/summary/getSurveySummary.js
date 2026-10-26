var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Survey = require('../../models/surveys/survey')
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var Organizations = require('../../models/organizations/organization')
var Campaigns = require('../../models/campaigns/campaign')

const getSurveySummary = async(detail) => {

  summaryTypes = {'User': '$userID', 'Activity': '$activityID', 'Organization': '$orgID', 'Geography': '$' + detail.geoType, 'Date': {$dateToString: { format: "%Y-%m-%d", date: "$creationDate", timezone: "-07" }}}

  if(!detail.surveyID){ return []}

  var match = {campaignID: detail.campaignID, 'surveyResponse.surveyID': detail.surveyID}

  if(detail.activityType !== "all") {match.activityType = detail.activityType}

  if(detail.orgID && detail.summaryType != "Organization") {match.orgID = detail.orgID}

  if(detail.userID) {match.userID = detail.userID}


  if(detail.startDate && !detail.endDate) {
    match.creationDate = {'$gte': new Date(detail.startDate)};
  }

  if(!detail.startDate && detail.endDate) {
    match.creationDate = {'$lte': new Date(detail.endDate)};
  }

  if(detail.startDate && detail.endDate) {
    match.creationDate = {'$gte': new Date(detail.startDate), '$lte': new Date(detail.endDate)};
  }

  if(detail.summaryType === 'Activity'){

    var activityTypeQuery = {campaignID: detail.campaignID}

    if(detail.activityName){
        var regexString = '^' + detail.activityName
        activityTypeQuery.name = { $regex: regexString }
    }
    
    var summaryTypeObjects = await Activity.find(activityTypeQuery)
    
    var activityIDs = summaryTypeObjects.map(x => {return String(x._id)})

    match.activityID = {'$in': activityIDs}
  }

  var results = await ActivityContactRecord.aggregate([
        {$match: match},
        {$unwind: "$surveyResponse.questionResponses"},
        {$match: {$or: [{'surveyResponse.questionResponses.questionType': "SINGLESELECT"}, {'surveyResponse.questionResponses.questionType': "MULTISELECT"}]}},
        {$group: {
          _id: {   
            typeID: summaryTypes[detail.summaryType], 
            question: "$surveyResponse.questionResponses.question",
            response: "$surveyResponse.questionResponses.response"
          },
          count: {$sum: 1}        
          }
        },
        {$group: {
          _id: {
            typeID: "$_id.typeID",
            question: "$_id.question"
          },
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
            _id: "$_id.typeID",
            questions: {
              $push: {
                question: "$_id.question",
                responses: "$responses"
              }
            }
          }
      }]
  )

  if(results.length === 0){return {rows: [], totalUniqueContacts: 0}}

  var contacts = await ActivityContactRecord.aggregate([
    {$match: match},
    {
        $group: {
          _id: summaryTypes[detail.summaryType],
          count: { $sum: 1 }
        }
    }
  ])

  // Distinct people within each row; a person contacted in two rows counts in both
  var uniqueContacts = await ActivityContactRecord.aggregate([
      {$match: match},
      {
        $group: {
          _id: {typeID: summaryTypes[detail.summaryType], personID: "$personID"}
        }
      },
      {
        $group: {
          _id: "$_id.typeID",
          count: { $sum: 1 }
        }
      }
      ])

  // Distinct people across all rows, for the TOTALS row (summing rows would double-count)
  var totalUniqueContacts = await ActivityContactRecord.aggregate([
      {$match: match},
      {$group: {_id: "$personID"}},
      {$count: "count"}
      ])

  if(detail.summaryType === 'User') { 
    var userIDs = results.map(x => {return String(x._id)})
    var summaryTypeObjects = await User.find({_id: {$in: userIDs}}, {name: 1, _id: 1})
  }

  if(detail.summaryType === 'Organization') {
    var campaign = await Campaigns.findOne({campaignID: detail.campaignID})
    var summaryTypeObjects = await Organizations.find({_id: {$in: campaign.orgIDs}})
  }

  if(detail.summaryType === 'Date' || detail.summaryType === 'Geography') {
    var summaryTypeObjects = results.map(x => {return {_id: x._id, name: x._id}})
  }

  var data_object_array = []

  var survey = await Survey.findOne({_id: detail.surveyID})
  
  results.map(result => {
    
    var data_object = {}

    if(result._id === null){
      result._id = "Not Specified"
    }
        
    const summaryTypeKey = summaryTypeObjects.find(summaryTypeObject => summaryTypeObject._id?.toString() === result._id.toString());
        
    data_object[detail.summaryType] = summaryTypeKey?.name.fullName || summaryTypeKey?.name || result._id;

    data_object['Unique Contacts'] = uniqueContacts.find(uniqueContact => uniqueContact._id?.toString() === result._id.toString())?.count
    data_object['Contacts'] = contacts.find(contact => contact._id?.toString() === result._id.toString())?.count

    survey.questions.filter(q => !q.orgIDs?.length || q.orgIDs.includes(detail.orgID)).forEach(question => {
      question.responses.forEach(response => {
        let key =   question.question + "-" + response.response;
        data_object[key] = 0;
      });
    })

    result.questions.forEach(question => {
      question.responses.forEach(response => {
            let key =   question.question + "-" + response.response;
            if(Object.hasOwn(data_object, key)){
              data_object[key] = response.count;
            }
      });
    });

    data_object_array.push(data_object)
  });

  data_object_array.sort((a, b) => {
    if (a[detail.summaryType].toLowerCase() < b[detail.summaryType].toLowerCase()) {
        return -1;
    }
    if (a[detail.summaryType].toLowerCase() > b[detail.summaryType].toLowerCase()) {
        return 1;
    }
    return 0;
  });  
                      
  return {rows: data_object_array, totalUniqueContacts: totalUniqueContacts[0]?.count ?? 0}
}

module.exports = {getSurveySummary}