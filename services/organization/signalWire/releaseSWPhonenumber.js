var Organization = require('../../../models/organizations/organization')
const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken
var CallPool = require('../../../models/organizations/swCallPool')

const releaseSWPhonenumber = async(detail) => {

    var orgID = detail.orgID;
  
    var org = await Organization.findOne({'_id': orgID})
  
    if(!org.signalWireAccount) return false
    if(!org.signalWireAccount.accountID) return false
  
    var accountID = org.signalWireAccount.accountID
    
    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

    var deleteUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/phone_numbers/' + detail.phonenumberID
    let deleteConfig = {method: 'delete', url: deleteUrl, headers: { 'Accept': 'application/json', 'Authorization': subAuthorization}};

    await CallPool.deleteOne({number: detail.phonenumber, orgID: detail.orgID})
    
    return await axios(deleteConfig).then((response) => {return response.data.data}).catch((error) => {return error.response.data});

}

module.exports = {releaseSWPhonenumber}