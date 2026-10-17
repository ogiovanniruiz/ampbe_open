const axios = require('axios');
var Organization = require('../../../models/organizations/organization')

const { RestClient } = require("@signalwire/compatibility-api");
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL

const getSWUsageSummary = async(detail) => {

    var org = await Organization.findOne({"_id": detail.orgID})
    var accountID = org.signalWireAccount.accountID

    var numSegments = 0
    var numMedia = 0
    
    const client = RestClient(accountID, API_TOKEN, {signalwireSpaceUrl: spaceURL});

    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');


    await client.messages.list({dateSentAfter: new Date(detail.startDate),dateSentBefore: new Date(detail.endDate)
    }).then((messages) =>

        messages.forEach((message) =>{
            numSegments = numSegments + message.numSegments
            numMedia = numMedia + message.numMedia
        })
    )

    var callSeconds = 0

    var run = true

    var voiceUrl = 'https://' + process.env.signalWireSpaceURL + '/api/voice/logs?&created_before='+ formatDate(detail.endDate) + '&created_after=' + formatDate(detail.startDate) + '&page_size=1000'

    while(run){
        voiceConfig = {method: 'get', maxBodyLength: Infinity, url: voiceUrl,  headers: { 'Accept': 'application/json', 'Authorization': subAuthorization}};
        var response = await axios.request(voiceConfig).then((response) => {return response}).catch((error) => {return error});
        if(!response.data.links.next){
            run = false
        }

        var totalDuration = response.data.data.reduce((sum, obj) => sum + obj.duration, 0);

        //const outboundArray = response.data.data.filter(item => item.direction === "outbound").map(x => {return x.duration});
    
        callSeconds += totalDuration
        voiceUrl = response.data.links.next
    }

    var callCount = callSeconds/60

    var phonenums = 0

    await client.incomingPhoneNumbers.list({}).then((numbers)=>{
        phonenums = numbers.length
    });

    return {numSegments, numMedia, callCount, phonenums} 
}


function formatDate(dateString) {
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = dateParts[1].padStart(2, '0');
    const day = dateParts[2].padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

module.exports = {getSWUsageSummary}