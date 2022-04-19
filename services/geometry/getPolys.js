var Poly = require('../../models/targets/poly')
var Campaign = require('../../models/campaigns/campaign')
var Organization = require('../../models/organizations/organization')

const getPolys = async(detail) => {
    try {

        var campaign = await Campaign.findOne({campaignID: detail.campaignID})

        var features = []

        for (var i = 0; i < campaign.orgIDs.length; i++){
            var polys = await Poly.find({'properties.orgID': campaign.orgIDs[i], 'properties.campaignID': detail.campaignID})
            var org = await Organization.findById(campaign.orgIDs[i])
            features.push({orgID: campaign.orgIDs[i], polys: polys, orgName: org.name})
        }

        return features
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPolys}
