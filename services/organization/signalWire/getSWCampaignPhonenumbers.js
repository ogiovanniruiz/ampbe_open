var Organization = require('../../../models/organizations/organization')
var Campaign = require('../../../models/campaigns/campaign');

const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken

const getSWCampaignPhonenumbers = async(detail) => {

  var orgID = detail.orgID;

  if(detail.campaignID != null){
      var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

      if(campaign.textingFundedByCreatorOrg){
          orgID = campaign.creatorOrg 
      }
  }

  var org = await Organization.findOne({'_id': orgID})

  if(!org.signalWireAccount) return false
  if(!org.signalWireAccount.accountID) return false

  var accountID = org.signalWireAccount.accountID
  
  const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

  var url = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/registry/beta/campaigns/'+ detail.textCampaignID + '/numbers'

  let campaignConfig = {method: 'get', url: url, headers: { 'Accept': 'application/json', 'Authorization': subAuthorization}};

  return await axios(campaignConfig).then((response) => {return response.data.data}).catch((error) => {return error});

}

module.exports = {getSWCampaignPhonenumbers}