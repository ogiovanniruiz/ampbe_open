var Organization = require('../../../models/organizations/organization')

const createTwilioAccount = async(orgID) => {
    try { 
        var org = await Organization.findOne({"_id": orgID.orgID})
        var account_sid = process.env.accountSid
        var auth_token = process.env.authToken
        const superClient = require('twilio')(account_sid, auth_token);
        var accountExists = false;
        var existingAccount = {}
        var orgName = org.name.substring(0, 63);

        await superClient.api.accounts.list({friendlyName: orgName, status: "active", limit: 20})
        .then(accounts => accounts.forEach(a => {accountExists = true;existingAccount = a}
        ));

        if(accountExists){
            org.twilioAccount.sid = existingAccount.sid;
            org.twilioAccount.authToken = existingAccount.authToken;
            org.save()
            return {success: true, org: org, account: account, msg: "Success."}
        }

        var account = await superClient.api.accounts.create({friendlyName: orgName}).then(account => {
            return account;
        });

        org.twilioAccount.sid = account.sid;
        org.twilioAccount.authToken = account.authToken;

        var voice_url = process.env.be + '/api/call'
        

        const subClient = require('twilio')(account.sid, account.authToken);

    
        var app = await subClient.applications.create({voiceMethod: 'POST', voiceUrl: voice_url,friendlyName: 'voice_api'})
        .then(application => {return application});

        org.twilioAccount.app_sid = app.sid
        org.save()

        return {success: true, org: org, account: account, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTwilioAccount}