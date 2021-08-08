var Campaign = require('../../models/campaigns/campaign')
var CallPool = require('../../models/organizations/callPool')

const four_minutes_in_ms = 4*1000*60 

const updateCallPool = async(data) => {
    try {
        var campaign = await Campaign.findOne({campaignID:  data.campaignID})

        var date = new Date();
        var dateUpdated = date - four_minutes_in_ms

        if(campaign.fundedByCreatorOrg){

            var number = await CallPool.findOne({orgID: campaign.creatorOrg, available: true})

            if(number){
                number.available = false;
                number.dateUpdated = date;
                number.save()
                return {number: number.number, success: true}
            }

            var numberLocked = await CallPool.findOne({orgID: campaign.creatorOrg, available: false, dateUpdated: {$lte: dateUpdated}})

            if(numberLocked){
                console.log("Number was locked and is passed to the next caller.")
                numberLocked.dateUpdated = date;
                numberLocked.save()
                return {number: numberLocked.number, success: true}
            }

        }else{
            var number = await CallPool.findOne({orgID: data.orgID, available: true})

            if(number){
                number.available = false;
                number.dateUpdated = date;
                number.save()
                return {number: number.number, success: true}
            }

            var numberLocked = await CallPool.findOne({orgID: data.orgID, available: false, dateUpdated: {$lte: dateUpdated}})

            if(numberLocked){
                console.log("Number was locked and is passed to the next caller.")
                numberLocked.dateUpdated = date;
                numberLocked.save()
                return {number: numberLocked.number, success: true}
            }
        }

        return {success: false}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateCallPool}