var User = require('../../models/users/user')

const getAllUsers = async() => {
    try { 
        return await User.find()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllUsers}