var Alert = require('../../models/hotline/alert')
const { RestClient } = require("@signalwire/compatibility-api");
var Responder = require('../../models/hotline/responder')
var Organization = require('../../models/organizations/organization')
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL
var CallPool = require('../../models/organizations/swCallPool')


const createAlert = async(alert) => {
    try { 

        var org = await Organization.findOne({'_id': alert.orgID})
      
        if(!org.signalWireAccount) return false
        if(!org.signalWireAccount.accountID) return false
      
        var accountID = org.signalWireAccount.accountID

        var callPool = await CallPool.find({orgID: alert.orgID, hotline_enabled: true})
        if(callPool.length === 0) return false 

        const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });

        var newAlert = new Alert(alert);


        if(newAlert.audiences.length > 0){ 
            var responders = await Responder.find({orgID: newAlert.orgID, audience: {$in: newAlert.audiences}})

        }else{
            var responders = await Responder.find({
                orgID: newAlert.orgID,
                location: {$geoWithin: {$centerSphere: [[newAlert.coordinates[0], newAlert.coordinates[1]], newAlert.radius / 6378.1] }}});
        }

      
        for(var i = 0; i < responders.length; i++){
            var outGoingMessage = {
                from: callPool[0].number,
                to: "+1" + responders[i].phonenumber,
                body: newAlert.textMessage
            }
            
            var message = await client.messages.create(outGoingMessage).then(message => {return message}).catch(error => {return error});
            console.log(message)
        }

        return newAlert.save();
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createAlert}