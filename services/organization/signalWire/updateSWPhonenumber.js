const axios = require('axios');
var Organization = require('../../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken

const updateSWPhonenumber = async(phonenumber) => {

    var orgID = phonenumber.orgID;
  
    var org = await Organization.findOne({'_id': orgID})
  
    if(!org.signalWireAccount) return false
    if(!org.signalWireAccount.accountID) return false
  
    var accountID = org.signalWireAccount.accountID
    
    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

    var phonenumberID = phonenumber.phone_number.id

    var sms_url = process.env.be + '/api/receiveSWText'

    let updateData = JSON.stringify({
        "name": phonenumber.phone_number.number,
        "message_handler": "laml_webhooks",
        "message_request_url": sms_url,
        "message_request_method": "POST",
    });
    
    var updateUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/phone_numbers/'+ phonenumberID

    let updateConfig = {method: 'put', url: updateUrl, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': subAuthorization}, data: updateData};
   
    update_results = await axios(updateConfig).then((response) => {return response.data}).catch((error) => {return error.response.data});

    console.log(update_results)

    return update_results
}

module.exports = {updateSWPhonenumber}