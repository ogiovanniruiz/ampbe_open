var User = require('../../models/users/user')
var { PERMISSION_USER_FIELDS } = require('../campaign/getCampaignPermissionUsers')

const updateDataManager = async(data) => {
    try {
        var userID = data.user?._id
        var campaignID = Number(data.campaignID)
        if(!userID || isNaN(campaignID)) return false

        var enabled = data.enabled

        // Older clients don't say which way to go: keep the original toggle
        if(typeof enabled !== 'boolean'){
            var current = await User.findById(userID, {dataManager: 1})
            if(!current) return false
            enabled = !(current.dataManager || []).includes(campaignID)
        }

        // Setting an explicit state means repeated or concurrent requests can't undo each other
        var update = enabled ? {$addToSet: {dataManager: campaignID}} : {$pull: {dataManager: campaignID}}

        return await User.findByIdAndUpdate(userID, update, {returnDocument: 'after', projection: PERMISSION_USER_FIELDS})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateDataManager}
