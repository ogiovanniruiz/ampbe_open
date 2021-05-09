var User = require('../../models/users/user')

const dbHealthCheck = async(app) => {
    try { 
        return await User.findOne()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {dbHealthCheck}