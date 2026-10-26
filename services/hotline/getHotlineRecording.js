
const axios = require('axios');
var Organization = require('../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken

const getHotlineRecording = async(detail) => {

    
    console.log("detail", detail)

    var orgID = detail.orgID;
    
    var org = await Organization.findOne({'_id': orgID})
    
    if(!org.signalWireAccount) return false
    if(!org.signalWireAccount.accountID) return false
    
    var accountID = org.signalWireAccount.accountID

    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');
    var url = 'https://' + process.env.signalWireSpaceURL + '/api/laml/2010-04-01/Accounts/' + accountID + '/Recordings/' + detail.callSid

    console.log("url", url)


    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url,
      headers: { 
        'Accept': 'application/json', 
        'Authorization': subAuthorization
      }
    };

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
    }

module.exports = {getHotlineRecording}