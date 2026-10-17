const axios = require('axios');
var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/swCallPool')
const {swErrorDetail, formatPhone, failure} = require('./swErrors')

const API_TOKEN = process.env.signalWireAPIToken
const BASE_URL = 'https://' + process.env.signalWireSpaceURL + '/api/relay/rest'

const buySWCallingPhonenumber = async(detail) => {

    const areacode = String(detail.areacode || '').trim()
    if(!/^\d{3}$/.test(areacode)) return failure("Area code must be 3 digits.")

    var org = await Organization.findOne({"_id": detail.orgID})
    if(!org || !org.signalWireAccount || !org.signalWireAccount.accountID) return failure("This organization doesn't have a SignalWire account yet.")

    var accountID = org.signalWireAccount.accountID
    const subAuthorization = 'Basic ' + Buffer.from(`${accountID}:${API_TOKEN}`).toString('base64');
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': subAuthorization}

    /////////SEARCH//////////////////////////

    let available_numbers
    try {
        const response = await axios({method: 'get', url: BASE_URL + '/phone_numbers/search?areacode=' + areacode + '&max_results=5', headers})
        available_numbers = response.data.data || []
    } catch(error) {
        return failure("Couldn't search SignalWire for numbers: " + swErrorDetail(error))
    }

    if(!available_numbers.length) return failure(`SignalWire has no numbers available in area code ${areacode} right now. Try a nearby area code.`)

    const number = available_numbers[0].e164

    //////////PURCHASE///////////////////////////////////////////////////////////

    let purchased
    try {
        const response = await axios({method: 'post', url: BASE_URL + '/phone_numbers', headers, data: JSON.stringify({"number": number})})
        purchased = response.data
    } catch(error) {
        return failure(`SignalWire wouldn't sell ${formatPhone(number)}: ` + swErrorDetail(error))
    }

    await new CallPool({number: number, orgID: detail.orgID}).save()

    // The number is bought from here on, so later failures come back as warnings
    const warnings = []

    ////////UPDATE//////////////////////////////////////////

    let updateData = JSON.stringify({
        "name": number,
        "message_handler": "laml_webhooks",
        "message_request_url": process.env.be + '/api/receiveSWText',
        "message_request_method": "POST",
    });

    try {
        await axios({method: 'put', url: BASE_URL + '/phone_numbers/' + purchased.id, headers, data: updateData})
    } catch(error) {
        warnings.push(`Bought ${formatPhone(number)}, but couldn't set it up to receive texts.`)
    }

    return {number, warnings}

}

module.exports = {buySWCallingPhonenumber}
