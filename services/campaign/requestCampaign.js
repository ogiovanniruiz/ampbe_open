var mongoose = require('mongoose')
var Campaign = require('../../models/campaigns/campaign')
var Organization = require('../../models/organizations/organization')

const requestCampaign = async(request) => {
    try { 
        var campaignID = Number(String(request.campaignID ?? '').trim())
        if(!Number.isInteger(campaignID) || campaignID < 0) return {success: false, msg: "Campaign ID should be a whole number."}

        var orgID = String(request.orgID || '')
        if(!mongoose.Types.ObjectId.isValid(orgID) || !(await Organization.exists({_id: orgID}))){
            return {success: false, msg: "Your organization couldn't be found."}
        }

        var campaign = await Campaign.findOne({campaignID}, {name: 1, orgIDs: 1, requests: 1})
        if (!campaign) return {success: false, msg: "No campaign has that ID."}
        if ((campaign.orgIDs || []).includes(orgID)) return {success: false, msg: "Your organization is already a member of this campaign."}

        // Atomic, so two quick requests can't add the org twice
        var result = await Campaign.updateOne(
            {campaignID, orgIDs: {$ne: orgID}, requests: {$ne: orgID}},
            {$addToSet: {requests: orgID}}
        )
        if (!result.modifiedCount) return {success: false, msg: "A request has already been sent to this campaign."}

        return {success: true, msg: "Success.", campaignName: campaign.name}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {requestCampaign}
