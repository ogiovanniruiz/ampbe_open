var Organization = require('../../models/organizations/organization')

const editOrg = async(data) => {
    try { 
        var org = await Organization.findOne({_id: data.orgID})

        if(data.command === 'edit'){

            var existingOrg = await Organization.findOne({name: data.name})
            if(existingOrg && (existingOrg.name != data.name)){
                return{success: false, msg: "Organization with that name already exists."}
            }

            if(org.twilioAccount.sid){
                const subClient = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
                await subClient.api.accounts(org.twilioAccount.sid).update({friendlyName: data.name}).then(account=> console.log(account.friendlyName))
            }

            org.name = data.name
            org.description = data.description
            org.subscription.expDate = data.expDate
            org.subscription.cost = data.cost

        }

        if (data.command === 'activate'){
            org.active = true
        }

        if(data.command === 'deactivate'){
            org.active = false
        }

        org.save()

        return {success: true, org: org, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editOrg}