var TextRecord = require('../../models/activities/textbank/textRecords')
const axios = require('axios');

const API_TOKEN = process.env.signalWireAPIToken
const signalWireMainProjectID = process.env.signalWireMainProjectID
const mainAuthorization = 'Basic ' + Buffer.from(`${signalWireMainProjectID}:${API_TOKEN}`).toString('base64');

const swPhoneLookup = async(incomingTextbankContactHistory) => {

    var record = await TextRecord.findOne({phone: incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber})

    if(record){
        console.log('Text record found, skipping lookup.')
        return record
    }

    var url = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest/lookup/phone_number/' + '+1' + incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber + "?include=carrier"

    let config = {method: 'get', url: url, headers: { 'Accept': 'application/json', 'Authorization': mainAuthorization}};

    var lookUpResults =  await axios(config).then((response) => {return response.data}).catch((error) => {return error});

    if(lookUpResults.carrier){
      var lineType = lookUpResults.carrier.linetype

      if(lineType === 'wireless'){
        lineType = "mobile"
      }

      var newRecord = {
                      deviceType: lineType,
                      personID: incomingTextbankContactHistory.person.resident.personID,
                      phone: incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber,
                      provider: lookUpResults.carrier.name,
                      error: false,
                      contactedBy: incomingTextbankContactHistory.userID
                    }

      console.log("Device Type Found.")

      var record = new TextRecord(newRecord);
      return record.save()
    }

    var newRecord = {
                      personID: incomingTextbankContactHistory.person.resident.personID,
                      phone: incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber,
                      error: true,
                      contactedBy: incomingTextbankContactHistory.userID
                    }
    console.log("Error Invalid Number or device type not found.")

    var record = new TextRecord(newRecord);
    return record.save()

}

module.exports = {swPhoneLookup}
