var Organization = require('../../../models/organizations/organization')
const axios = require('axios');
const qs = require('qs');

const API_TOKEN = process.env.signalWireAPIToken
const signalWireMainProjectID = process.env.signalWireMainProjectID
const mainAuthorization = 'Basic ' + Buffer.from(`${signalWireMainProjectID}:${API_TOKEN}`).toString('base64');

const createSWAccount = async(detail) => {
    var org = await Organization.findOne({"_id": detail.orgID})

    let data = qs.stringify({'FriendlyName': org.name});

    let config = {method: 'post', url: 'https://' + process.env.signalWireSpaceURL + '/api/laml/2010-04-01/Accounts',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Authorization': mainAuthorization},
        data : data
    };

    var response = await axios(config).then((response) => {return response.data}).catch((error) => {return error});

    org.signalWireAccount.accountID = response.sid

    return org.save()

}

module.exports = {createSWAccount}