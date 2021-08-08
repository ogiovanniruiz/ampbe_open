var User = require('../../models/users/user')

const submitAgreement = async(data) => {
    try {
        var user = await User.findOne({_id: data.user._id});

        user.userAgreements.push({version: data.version})
        user.save()
        return {success: true, user: user, msg: "Success."}   

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitAgreement}