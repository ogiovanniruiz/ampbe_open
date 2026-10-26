var Organization = require('../../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL
const { RestClient } = require("@signalwire/compatibility-api");


const getAllSWPhonenumbers = async(detail) => {

  var org = await Organization.findOne({'_id': detail.orgID})
  var accountID = org.signalWireAccount.accountID
  
  const client = RestClient(accountID, API_TOKEN, {signalwireSpaceUrl: spaceURL});

  var phonenumbers = []
  await client.incomingPhoneNumbers.list({}).then((numbers)=>{
    phonenumbers = numbers
  });

  return phonenumbers

}

module.exports = {getAllSWPhonenumbers}