var User = require('../../models/users/user')

const updateHomeOrg = async(data) => {
    try {
        var user = await User.findOne({_id: data.userID});
        user.homeOrgID = data.orgID

        return user.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateHomeOrg}