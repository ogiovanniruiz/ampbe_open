var User = require('../../models/users/user')

const getAllUsers = async() => {
    try { 
        return await User.find().sort({_id: -1})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllUsers}