var COI = require('../../models/assets/coi')
var Campaign = require('../../models/campaigns/campaign')
var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

const getCOIReport = async(data) => {
    try { 

        var datePicker = '';

        if (data.dateStart && !data.dateEnd) {
            var datePicker = {'$gte': data.dateStart};
        }
        if (!data.dateStart && data.dateEnd) {
            var datePicker = {'$lte': data.dateEnd};
        }
        if (data.dateStart && data.dateEnd) {
            var datePicker = {'$gte': data.dateStart, '$lte': data.dateEnd};
        }
        var returnData = []

        if(data.mode === 'org'){

            var campaign = await Campaign.findOne({campaignID: data.campaignID})

            for (var i = 0; i < campaign.orgIDs.length; i++){
                var query = {'properties.orgID': campaign.orgIDs[i]}

                if(datePicker != ''){
                    query['properties.date'] = datePicker
                }
                
                var numCois = await COI.find(query).countDocuments()
                var org = await Organization.findById(campaign.orgIDs[i])
                returnData.push({ Organization: org.name, '#Cois': numCois})
            }

        }else if (data.mode === 'user'){

            var org = await Organization.findById(data.orgID)
            for (var i = 0; i < org.userIDs.length; i++){
                var query = {'properties.userID': org.userIDs[i]}

                if(datePicker != ''){
                    query['properties.date'] = datePicker
                }
                var numCois = await COI.find(query).countDocuments()
                var user = await User.findById(org.userIDs[i])
                returnData.push({'User Name': user.name.fullName, '#Cois': numCois})
            }
        }

        return returnData

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCOIReport}