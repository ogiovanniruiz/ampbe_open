var User = require('../../models/users/user')

const updateUser = async(userData) => {
    try {        
        var user = await User.findOne({_id: userData._id});

        if(user){
            user.name.firstName = userData.name.firstName
            user.name.lastName = userData.name.lastName
            user.name.fullName = userData.name.firstName + " " + userData.name.lastName
            return user.save()
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateUser}