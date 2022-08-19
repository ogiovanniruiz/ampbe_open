var Organization = require('../../../models/organizations/organization')
var ClientCapability = require('twilio').jwt.ClientCapability;
var Campaign = require('../../../models/campaigns/campaign');
var TextbankContactHistory = require('../../../models/activities/textbank/textbankContactHistory')

const getTwilioUsageSummary = async(detail) => {
    try { 
        var org = await Organization.findById(detail.orgID)

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
        console.log(org.twilioAccount)

        var rf = 0
        var data = {}

        return new Promise(function(resolve, reject){
            client.usage.records.each( record =>{
                //console.log(record)
                if(record.category === 'mms'){
                    data.mmsCount = record.usage
                }
                if(record.category === 'sms'){
                    
                    data.smsCount = record.usage
                }
                if(record.category === 'phonenumbers'){
                    data.phonenums = record.count
                }

                //if(record.category === 'calls'){
                //    data.calls = record.count
                //}

                if(record.category === 'calls-client'){
                    data.clientCount = record.count
                }
                if(record.category === 'calls-outbound'){
                    console.log(record)
                    data.callCount = record.count
                    resolve(data)
                }
            })
        })
    
    } catch(e){
        throw new Error(e.message)
    }
}



module.exports = {getTwilioUsageSummary}