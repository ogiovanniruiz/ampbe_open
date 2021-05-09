var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')

const updateUserOrgLevel = async(data) => {
    try {
        var user = await User.findOne({_id: data.user._id})
        var org = await Organization.findById(data.org._id)

        for(var i = 0; i < org.requests.length; i++){ 
            if (org.requests[i] === data.user._id) {
                org.requests.splice(i, 1); 
            }
        } 

        if(data.level === "REMOVE"){

            for(var i = 0; i < user.orgPermissions.length; i++){ 
                if (user.orgPermissions[i].orgID === data.org._id) {
                    user.orgPermissions.splice(i,1)
                }
            }

            for(var i = 0; i < org.userIDs.length; i++){
                if(org.userIDs[i] === data.user._id){
                    org.userIDs.splice(i,1)
                }
            }

            org.save()
            user.save()
            return {success: true, org: org, user: user, msg: "Org Access Removed."}
        }

        for(var i = 0; i < user.orgPermissions.length; i++){
            if (user.orgPermissions[i].orgID === data.org._id) {
                user.orgPermissions[i].level = data.level
                user.save()
                return {success: true, org: org, user: user, msg: "Org Level Updated."}
            }
        }

        user.orgPermissions.push({level: data.level, orgID: data.org._id})
        user.save()

        org.userIDs.push(user._id)
        org.save()

        return {success: true, org: org, user: user, msg: "Org Level Appended."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateUserOrgLevel}