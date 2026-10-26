const textConversation = require('../../models/activities/textbank/textConversation')
var HotlineMessage = require('../../models/hotline/hotlineMessage')
var SWCallPool = require('../../models/organizations/swCallPool')
var Responders = require('../../models/hotline/responder')
var GetSWVideoURL = require('../organization/signalWire/getSWVideoURL')

const hotlineReceiveText = async(message) => {
    try { 

        var swCallPool = await SWCallPool.findOne({number: message.To})

        var foundHotlineConversation = await HotlineMessage.findOne({externalPhonenumber: message.From, orgID: swCallPool.orgID})

        var externalPhonenumber = message.From.replace("+1", "")

        var name = {firstName: "Unknown", lastName: "", middleName: "", fullName: ""}
        var responder = await Responders.findOne({orgID: swCallPool.orgID, phonenumber: externalPhonenumber})

        if(responder){
            name = responder.name
        }

        console.log("found responder", responder)

        if(foundHotlineConversation){
            foundHotlineConversation.textConversation.push({origin: "external", msg: message.Body, mediaUrl: message.MediaUrl0, mediaUrlType: message.MediaContentType0})
            foundHotlineConversation.name = name
            console.log("found hotline conversation", foundHotlineConversation)
            return foundHotlineConversation.save()
        }

        console.log(message)

        var newHotlineMessageObject = {
                                       orgID: swCallPool.orgID, 
                                       externalPhonenumber: message.From,
                                       internalPhonenumber: message.To,
                                       name: name,
                                       textConversation: [{origin: "external", msg: message.Body, mediaUrl: message.MediaUrl0, mediaUrlType: message.MediaContentType0}]
                                    }

        var newHotlineMessage = new HotlineMessage(newHotlineMessageObject)

        return newHotlineMessage.save()
   
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {hotlineReceiveText}