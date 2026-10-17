var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var Organizations = require('../../models/organizations/organization')
var Campaigns = require('../../models/campaigns/campaign')

const getActivitySummary = async(detail) => {
  try {
    let summaryTypes = {'User': '$userID', 'Activity': '$activityID', 'Organization': '$orgID', 'Geography': '$' + detail.geoType, 'Date': {$dateToString: { format: "%Y-%m-%d", date: "$creationDate", timezone: "-07" }}}
 
    var match = {campaignID: detail.campaignID}

    if(detail.activityType !== "all") {match.activityType = detail.activityType}
    
    if(detail.orgID && detail.summaryType != "Organization") {match.orgID = detail.orgID}

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

      var activityHouseholdRecords = await ActivityHouseholdRecord.aggregate([
        {$match: {activityID: {$in: activityIDs}}},
        
        {            $group: {
              _id: "$activityID",
              totalHHs: { $sum: 1 },
        }
        }
      ])

    }

    var results = await ActivityContactRecord.aggregate([
          {$match: match},
          {
            $group: {
              _id: summaryTypes[detail.summaryType],
              uniquePersonIDs: { $addToSet: "$personID" },
              uniqueAddresses: { $addToSet: "$person.address" },
              calls: {$push: "$phonebankContactDetails"},
              textSent: {$push: "$textbankContactDetails.textSuccessful"},
              textResponded: {$push: "$textbankContactDetails.textReceived"},
            }
          },
          {
            $project: {
              _id: 1,
              uniquePersonCount: { $size: "$uniquePersonIDs" },
              uniqueAddressCount: { $size: "$uniqueAddresses" },
              calls: {$size: "$calls"},
              textSent: {$size: '$textSent'},
              textResponded: {$size: {$filter: {input: "$textResponded", cond: {$eq: ["$$this.status", true]}}}}
            
          }, 
        }
    ])

    var uniqueUsers = await ActivityContactRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            summaryType: summaryTypes[detail.summaryType],  // group key expression
            userID: "$userID"
          }
        }
      },
      {
        $group: {
          _id: "$_id.summaryType",
          count: { $sum: 1 }
        }
      }
    ]);
    

    match['surveyResponse'] = {$exists: true}

    var contacts = await ActivityContactRecord.aggregate( [
          {$match: match},         
          {
            $group: {
              _id: summaryTypes[detail.summaryType],
              count: { $sum: 1 }
            }
          }
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

      if(detail.summaryType === 'Activity') {
        


      }
    var data_object_array = []

    results.map(result => {

      var data_object = {}

      if(result._id === null){
         result._id = "Not Specified"
      }

      const summaryTypeKey = summaryTypeObjects.find(summaryTypeObject => summaryTypeObject._id?.toString() === result._id.toString());
      data_object[detail.summaryType] = summaryTypeKey?.name.fullName || summaryTypeKey?.name || result._id;

      if(detail.summaryType === 'Activity') {
        const hhcount = activityHouseholdRecords.find(record => record._id?.toString() === result._id.toString())
      
        if(hhcount) data_object['% Complete'] = Math.round(result.uniqueAddressCount/hhcount.totalHHs * 100) + "%"

      }

    if(detail.summaryType !== 'User'){
      data_object['Unique Users'] = uniqueUsers.find(uniqueUser => uniqueUser._id?.toString() === result._id.toString())?.count
    }

      data_object['Households'] = result.uniqueAddressCount
      data_object['Residents'] = result.uniquePersonCount
      data_object['Call Attempts'] = result.calls
      data_object['Text Sent'] = result.textSent
      data_object['Text Responded'] = result.textResponded
      data_object['All Activity Contacts'] = 0

      const contact = contacts.find(contact => {
        if (contact._id == null && result._id == null) return true;
        if (contact._id != null && result._id != null) { return contact._id.toString() === result._id.toString()}
          return false;
        });

      if(contact) data_object['All Activity Contacts'] = contact.count

      data_object['Contacts/Households'] = Math.round((data_object['All Activity Contacts']/data_object['Households'])*100) + "%"
      data_object['Contacts/Residents'] = Math.round((data_object['All Activity Contacts']/data_object['Residents'])*100) + "%"

            
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

  } catch(e){
    throw new Error(e.message)
  }

}

module.exports = {getActivitySummary}