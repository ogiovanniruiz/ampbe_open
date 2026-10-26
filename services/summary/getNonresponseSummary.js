var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var Organizations = require('../../models/organizations/organization')
var Campaigns = require('../../models/campaigns/campaign')
var NonresponseSet = require('../../models/surveys/nonResponseSet')

const getNonresponseSummary = async(detail) => {

    summaryTypes = {'User': '$userID', 'Activity': '$activityID', 'Organization': '$orgID', 'Geography': '$' + detail.geoType, 'Date': {$dateToString: { format: "%Y-%m-%d", date: "$creationDate", timezone: "-07" }}}

    var match = {campaignID: detail.campaignID, 'nonResponse.nonResponseSetID': detail.nonResponseSetID}
    
    if(detail.activityType !== "all") {match.activityType = detail.activityType}

    if(detail.userID) {match.userID = detail.userID}

    if (detail.startDate && !detail.endDate) {
        match.creationDate = {'$gte': new Date(detail.startDate)};
    }

    if (!detail.startDate && detail.endDate) {
        match.creationDate = {'$lte': new Date(detail.endDate)};
    }

    if (detail.startDate && detail.endDate) {
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

    if(detail.orgID && detail.summaryType != "Organization") {match.orgID = detail.orgID}

    var results = await ActivityContactRecord.aggregate([
        {$match: match},
        {$group: 
          {_id: 
            {typeID: summaryTypes[detail.summaryType], nonResponse: "$nonResponse.nonResponse"},
          count: {$sum: 1}        
        }},
        {$group: {
          _id: "$_id.typeID",
          nonResponses: {
            $push: {nonResponse: "$_id.nonResponse", count: "$count"}
          }  
            }
        },
    ])

    if(results.length === 0){return []}

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

    var nonresponseSet = await NonresponseSet.findOne({_id: detail.nonResponseSetID})
    
    results.map(result => {

        var data_object = {}

        if(result._id === null){
          result._id = "Not Specified"
        }

        const summaryTypeKey = summaryTypeObjects.find(summaryTypeObject => summaryTypeObject._id?.toString() === result._id.toString());
        
        data_object[detail.summaryType] = summaryTypeKey?.name.fullName || summaryTypeKey?.name || result._id;

        nonresponseSet.nonResponses.forEach(nonresponse => {
          let key = nonresponse.nonResponse
          data_object[key] = 0
        })

        result.nonResponses.forEach(nonResponse =>{
          if(nonResponse.nonResponse){
              let key = nonResponse.nonResponse
              data_object[key] = nonResponse.count
          }
        })
      
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
              
    return data_object_array
}

module.exports = {getNonresponseSummary}