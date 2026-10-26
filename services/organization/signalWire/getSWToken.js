const axios = require('axios');
var Organization = require('../../../models/organizations/organization')
var Campaign = require('../../../models/campaigns/campaign');

const API_TOKEN = process.env.signalWireAPIToken

const getSWToken = async(detail) => {
    try { 
        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

        var orgID = detail.orgID;

        if(campaign){
            if(campaign.fundedByCreatorOrg){
                orgID = campaign.creatorOrg
            }
        }

        var org = await Organization.findOne({"_id": orgID})

        var accountID = org.signalWireAccount.accountID

        const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

        var searchUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/jwt'

        let searchConfig = {method: 'post', url: searchUrl,  headers: { 'Accept': 'application/json', 'Authorization': subAuthorization}};
    
        var token = await axios(searchConfig).then((response) => {return response.data.jwt_token}).catch((error) => {return error});
    
        return {token: token, projectID: accountID}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getSWToken}