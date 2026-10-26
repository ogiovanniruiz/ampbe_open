const axios = require('axios');
var Organization = require('../../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken

// Takes a number off its 10DLC texting campaign; the number stays in the subproject and call pool
const removeSWCampaignAssignment = async(detail) => {

    var org = await Organization.findOne({"_id": detail.orgID})

    if(!org.signalWireAccount) return false
    if(!org.signalWireAccount.accountID) return false

    var accountID = org.signalWireAccount.accountID
    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');

    var deleteUrl = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/registry/beta/numbers/' + detail.assignmentID

    let deleteConfig = {method: 'delete', url: deleteUrl, headers: { 'Accept': 'application/json', 'Authorization': subAuthorization}};

    return await axios(deleteConfig).then(() => {return {success: true}}).catch((error) => {
        return {errors: error.response?.data?.errors || [{detail: error.message}]}
    });

}

module.exports = {removeSWCampaignAssignment}
