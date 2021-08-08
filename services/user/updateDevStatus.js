var User = require('../../models/users/user')

const updateDevStatus = async(data) => {
    try {
        var user = await User.findOne({_id: data.user._id});

        user.dev = data.developer
        return user.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateDevStatus}