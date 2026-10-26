var Organization = require('../../../models/organizations/organization')
const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken
const signalWireMainProjectID = process.env.signalWireMainProjectID
const authorization = 'Basic ' + Buffer.from(`${signalWireMainProjectID}:${API_TOKEN}`).toString('base64');

const getOrgBrand = async(detail) => {

  return false

  var org = await Organization.findById(detail.orgID)

  var url = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/registry/beta/brands/' + org.signalWireAccount.brandID + '/campaigns'

  var authorization = 'Basic ' + process.env.signalWireToken

  let campaignConfig = {method: 'get', url: url, headers: { 'Accept': 'application/json', 'Authorization': authorization}};

  return await axios(campaignConfig).then((response) => {return response.data}).catch((error) => {return error});

}

module.exports = {getOrgBrand}