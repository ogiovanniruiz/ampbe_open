var Organization = require('../../../models/organizations/organization')
const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken
const signalWireMainProjectID = process.env.signalWireMainProjectID
const mainAuthorization = 'Basic ' + Buffer.from(`${signalWireMainProjectID}:${API_TOKEN}`).toString('base64');

const checkSWAccount = async(detail) => {

    var org = await Organization.findOne({"_id": detail.orgID})

    if(!org.signalWireAccount) return false

    if(!org.signalWireAccount.accountID) return false

    var url = 'https://' + process.env.signalWireSpaceURL + '/api/laml/2010-04-01/Accounts/' + org.signalWireAccount.accountID
    let config = {method: 'get', url: url, headers: {'Accept': 'application/json', 'Authorization': mainAuthorization}};

    return await axios(config).then((response) => {return response.data}).catch((error) => {return error});

}

module.exports = {checkSWAccount}