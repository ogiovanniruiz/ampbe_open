var COI = require('../../models/assets/coi')
var Campaign = require('../../models/campaigns/campaign')
var Organization = require('../../models/organizations/organization')

const getCOIReport = async(coiDetail) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: coiDetail.campaignID})

        var features = []

        for (var i = 0; i < campaign.orgIDs.length; i++){
            var cois = await COI.find({'properties.orgID': campaign.orgIDs[i]})
            var org = await Organization.findById(campaign.orgIDs[i])
            features.push({orgID: campaign.orgIDs[i], cois: cois, orgName: org.name})
        }

        return features
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCOIReport}