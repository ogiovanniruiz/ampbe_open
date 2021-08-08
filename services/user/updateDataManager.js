var User = require('../../models/users/user')

const updateDataManager = async(data) => {
    try {
        var user = await User.findOne({'_id': data.user._id});

        if(user.dataManager.includes(data.campaignID)){
            for(var i = 0; i < user.dataManager.length; i++){
                if(user.dataManager[i] === data.campaignID){
                    user.dataManager.splice(i, 1)
                    return user.save()
                }
            }
            
        }else{
            user.dataManager.push(data.campaignID)
            return user.save()
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateDataManager}