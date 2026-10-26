const { RestClient } = require("@signalwire/compatibility-api");
var Organization = require('../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL

var HotlineMessage = require('../../models/hotline/hotlineMessage')
var CallPool = require('../../models/organizations/swCallPool')

const sendFollowUpHotlineText = async(detail) => {
    try { 

        var org = await Organization.findOne({'_id': detail.orgID})
        
        if(!org.signalWireAccount) return false
        if(!org.signalWireAccount.accountID) return false

        var callPool = await CallPool.find({orgID: detail.orgID, hotline_enabled: true})
        if(callPool.length === 0) return false 
        
        var accountID = org.signalWireAccount.accountID

        const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });

        var outGoingMessage = {
            from: callPool[0].number,
            to: detail.destinationNumber,
            body: detail.text
        }
        
        var message = await client.messages.create(outGoingMessage).then(message => {return message}).catch(error => {return error});

        var foundHotlineConversation = await HotlineMessage.findOne({externalPhonenumber: outGoingMessage.to, orgID: detail.orgID})

        foundHotlineConversation.textConversation.push({origin: "internal", msg: outGoingMessage.body})
        
        foundHotlineConversation.save()
        
        console.log(message)

        return message
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {sendFollowUpHotlineText}