
var CallPool = require('../../models/organizations/swCallPool')
const axios = require('axios');
var Organization = require('../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken

const enableHotlinePhonenumber = async(detail) => {
    try { 

        var phonenumber = await CallPool.findOne({number: detail.phonenumber.phone_number.number})
        phonenumber.hotline_enabled = detail.checked

        var orgID = phonenumber.orgID;
        
        var org = await Organization.findOne({'_id': orgID})
        
        if(!org.signalWireAccount) return false
        if(!org.signalWireAccount.accountID) return false
        
        var accountID = org.signalWireAccount.accountID
        
        const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');
    
        var phonenumberID = detail.phonenumber.phone_number.id
        if(detail.checked){
            var sms_url = process.env.be + '/api/hotlineReceiveText'
            var voice_url = process.env.be + '/api/incomingHotlineCall'
        }else{
            var sms_url = process.env.be + '/api/receiveSWText'
            var voice_url = ""
        }
    
        let updateData = JSON.stringify({
            "name": detail.phonenumber.phone_number.number,
            "message_handler": "laml_webhooks",
            "message_request_url": sms_url,
            "message_request_method": "POST",
            "call_request_url": voice_url,
            "call_request_method": "POST",
            "call_handler": "laml_webhooks",
        });
        
        var updateUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/phone_numbers/'+ phonenumberID
    
        let updateConfig = {method: 'put', url: updateUrl, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': subAuthorization}, data: updateData};
        
        update_results = await axios(updateConfig).then((response) => {return response.data}).catch((error) => {return error.response.data});

        return phonenumber.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {enableHotlinePhonenumber}