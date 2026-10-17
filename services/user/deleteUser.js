var User = require('../../models/users/user')

const deleteUser = async(data) => {
    try {
        return await User.deleteOne({_id: data.userID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteUser}