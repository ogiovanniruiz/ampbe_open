var Organization = require('../../../models/organizations/organization')

const getTwilioUsageSummary = async(detail) => {
    try { 
        var org = await Organization.findById(detail.orgID)

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
        var data = {}

        return new Promise(function(resolve, reject){

            client.usage.records.list({
                startDate: new Date(detail.startDate),
                endDate: new Date(detail.endDate),
              }).then(records => records.forEach(record => {

                if(record.category === 'mms'){
                    data.mmsCount = record.usage
                }
                if(record.category === 'sms'){
                    
                    data.smsCount = record.usage
                }
                if(record.category === 'phonenumbers'){

                    data.phonenums = record.count
                }
                if(record.category === 'calls-client'){
                    data.clientCount = record.usage
                }
                if(record.category === 'calls-globalconference'){
                    data.callConference = record.usage                
                }
                if(record.category === 'calls-outbound'){
                    data.callCount = record.usage
                    resolve(data)
                }
              }));
        })
    
    } catch(e){
        throw new Error(e.message)
    }
}



module.exports = {getTwilioUsageSummary}