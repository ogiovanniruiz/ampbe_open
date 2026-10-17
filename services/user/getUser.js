var User = require('../../models/users/user')
const getUser = async(user) => {
    try { 
        return await User.findOne({_id: user._id})    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getUser}