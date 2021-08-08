var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')

const createRdrUser = async(data) => {
    try {

        var user = await User.findOne({loginEmail: data.user.loginEmail})

        var org = await Organization.findById(data.orgID)

        for(var i = 0; i < user.orgPermissions.length; i++){
            if (user.orgPermissions[i].orgID === data.orgID) {
                return {success: false, msg: "User already a member of this org."}
            }
        }

        user.orgPermissions.push({level: "VOLUNTEER", orgID: data.orgID})
        user.save()

        org.userIDs.push(user._id)
        org.save()

        return {success: true, msg: "User added to the org."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createRdrUser}