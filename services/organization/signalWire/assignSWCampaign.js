const axios = require('axios');
var Organization = require('../../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken

const assignSWCampaign = async(detail) => {

    var org = await Organization.findOne({"_id": detail.orgID})
    var accountID = org.signalWireAccount.accountID
    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

    //////////ASSIGN////////////////////////////////////
    
    let assignData = JSON.stringify({
        "phone_numbers": [detail.phonenumber.phoneNumber]
      });
    var assignUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/registry/beta/campaigns/'+ detail.textingCampaign.id + '/orders'

    let assignConfig = {method: 'post', url: assignUrl, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': subAuthorization}, data: assignData};
   
    // SignalWire answers a refused order with {errors: [...]}; the client shows it instead of a success
    var order = await axios(assignConfig).then((response) => {return response.data}).catch((error) => {
        return {errors: error.response?.data?.errors || [{detail: error.message}]}
    });

    if(order.errors) return order

    ////////UPDATE//////////////////////////////////////////

    var phonenumberID = detail.phonenumber.sid

    var sms_url = process.env.be + '/api/receiveSWText'

    let updateData = JSON.stringify({
        "name": detail.phonenumber.phoneNumber,
        "message_handler": "laml_webhooks",
        "message_request_url": sms_url,
        "message_request_method": "POST",
    });
    
    var updateUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/phone_numbers/'+ phonenumberID

    let updateConfig = {method: 'put', url: updateUrl, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': subAuthorization}, data: updateData};
   
    await axios(updateConfig).then((response) => {return response.data.data}).catch((error) => {return error.response.data});

    return order
    
}

module.exports = {assignSWCampaign}