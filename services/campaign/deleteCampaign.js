var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')
var User = require('../../models/users/user')

const deleteCampaign = async(detail) => {
    try {

        await Campaign.deleteOne({campaignID: detail.campaignID});
        var org = await Organization.find({_id: {$in: detail.orgIDs}});
        if (org.length){
            for( var i = 0; i < org.length; i++){
                for( var j = 0; j < org[i].campaignIDs.length; j++){
                    if (org[i].campaignIDs[j] === detail.campaignID.toString()) {
                        await org[i].campaignIDs.splice(j, 1);
                    }
                }
                await org[i].save();
            }
        }

        var users = await User.find({dataManager: {$in: detail.campaignID}});
        if (users.length){
            for( var i = 0; i < users.length; i++){
                for( var j = 0; j < users[i].dataManager.length; j++){
                    if (users[i].dataManager[j] === detail.campaignID) {
                        await users[i].dataManager.splice(j, 1);
                    }
                }
                await users[i].save();
            }
        }

        return {success: true, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteCampaign}
