var Organization = require('../../../models/organizations/organization')
var ClientCapability = require('twilio').jwt.ClientCapability;
var Campaign = require('../../../models/campaigns/campaign');
var TextbankContactHistory = require('../../../models/activities/textbank/textbankContactHistory')

const getTwilioUsageSummary = async(detail) => {
    try { 
        var org = await Organization.findById(detail.orgID)
        //console.log(org.name)
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var rf = 0
        var data = {}

        return new Promise(function(resolve, reject){
            client.usage.records.each( record =>{
                if(record.category === 'mms'){
                    data.mmsCount = record.count
                }
                if(record.category === 'sms'){
                    data.smsCount = record.count
                }
                if(record.category === 'phonenumbers'){
                    //console.log(record)
                    data.phonenums = record.count
                }

                if(record.category === 'calls'){
                    data.calls = record.count
                }

                if(record.category === 'calls-client'){
                    data.clientCount = record.count
                }
                if(record.category === 'calls-outbound'){
                    data.callCount = record.count
                    resolve(data)
                }
            })
        })

        var numberContacts = 0 //await TextbankContactHistory.countDocuments({orgID: detail.orgID})
        return {numContacts: rf}
    
    } catch(e){
        throw new Error(e.message)
    }
}



module.exports = {getTwilioUsageSummary}