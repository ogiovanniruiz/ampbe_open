var Campaign = require('../../../models/campaigns/campaign')
var CallPool = require('../../../models/organizations/swCallPool')
var Activity = require('../../../models/activities/activity')

const four_minutes_in_ms = 4*1000*60 

const updateSWCallPool = async(data) => {
    try {

        // No new calls for a deactivated activity (only checked when the caller sends activityID)
        if(data.activityID){
            var activity = await Activity.findById(data.activityID, {active: 1})
            if(!activity || activity.active === false){
                return {inactive: true}
            }
        }

        var campaign = await Campaign.findOne({campaignID:  data.campaignID})

        var date = new Date();
        var dateUpdated = date - four_minutes_in_ms

        if(campaign.fundedByCreatorOrg){

            const count = await CallPool.countDocuments({orgID: campaign.creatorOrg, available: true, hotline_enabled: false});
            const random = Math.floor(Math.random() * count);

            var number = await CallPool.findOne({orgID: campaign.creatorOrg, available: true, hotline_enabled: false}).skip(random);

            if(number){
                number.available = false;
                number.numCalls = number.numCalls + 1
                number.dateUpdated = date;
                await number.save()
                return number
            }

            var numberLocked = await CallPool.findOne({orgID: campaign.creatorOrg, available: false, dateUpdated: {$lte: dateUpdated}, hotline_enabled: false})

            if(numberLocked){
                console.log("Number was locked and is passed to the next caller.")
                numberLocked.dateUpdated = date;
                numberLocked.numCalls = numberLocked.numCalls + 1
                await numberLocked.save()
                return numberLocked
            }

        }else{

            const count = await CallPool.countDocuments({orgID: data.orgID, available: true, hotline_enabled: false});
            const random = Math.floor(Math.random() * count);

            var number = await CallPool.findOne({orgID: data.orgID, available: true, hotline_enabled: false}).skip(random);

            if(number){
                number.available = false;
                number.dateUpdated = date;
                number.numCalls = number.numCalls + 1
                await number.save()
                return number
            }

            var numberLocked = await CallPool.findOne({orgID: data.orgID, available: false, dateUpdated: {$lte: dateUpdated}, hotline_enabled: false})

            if(numberLocked){
                console.log("Number was locked and is passed to the next caller.")
                numberLocked.dateUpdated = date;
                numberLocked.numCalls = numberLocked.numCalls + 1
                await numberLocked.save()
                return numberLocked
            }
        }

        return false
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateSWCallPool}