var Organization = require('../../../models/organizations/organization')

const checkTwilioAccount = async(detail) => {
    try { 

        var org = await Organization.findOne({"_id": detail.orgID})

        var account_sid = process.env.accountSid
        var auth_token = process.env.authToken

        if(org.twilioAccount.sid && org.twilioAccount.authToken){
            const superClient = require('twilio')(account_sid, auth_token);
            var accountExists = false;
        
            var orgName = org.name.substring(0, 63);
            
            await superClient.api.accounts.list({friendlyName: orgName, status: "active", limit: 20})
                               .then(accounts => accounts.forEach(a => 
                                {
                                    accountExists = true
                                    existingAccount = a
                                }
                               ));
        
            if(accountExists){ 
                return {msg: "Account Exists", status: true}
                
            }
    
        }

        return {msg: "Account does not exist", status: false}

        
        
        
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {checkTwilioAccount}