var Organization = require('../../../models/organizations/organization')
var Campaign = require('../../../models/campaigns/campaign');

const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken
const signalWireMainProjectID = process.env.signalWireMainProjectID
const mainAuthorization = 'Basic ' + Buffer.from(`${signalWireMainProjectID}:${API_TOKEN}`).toString('base64');

const getOrgSWCampaigns = async(detail) => {

    var orgID = detail.orgID;

    if(detail.campaignID != null){
        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

        if(campaign.textingFundedByCreatorOrg){
            orgID = campaign.creatorOrg 
        }
    }

    var org = await Organization.findById(orgID)

    if(!org.signalWireAccount) return false
    if(!org.signalWireAccount.brandID) return false

    var url = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/registry/beta/brands/' + org.signalWireAccount.brandID + '/campaigns'

    let campaignConfig = {method: 'get', url: url, headers: { 'Accept': 'application/json', 'Authorization': mainAuthorization}};

    var campaigns = await axios(campaignConfig).then((response) => {return response.data.data}).catch((error) => {return error});

    // Inactive texting operations can't send, so only Edit Activity asks for them (to keep a saved one selectable)
    if(Array.isArray(campaigns) && !detail.includeInactive){
        return campaigns.filter(campaign => campaign.state === 'active')
    }

    return campaigns

}

module.exports = {getOrgSWCampaigns}