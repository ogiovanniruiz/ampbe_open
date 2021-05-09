var Activity = require('../../models/activities/activity')
var Campaign = require('../../models/campaigns/campaign')
var HouseHold = require('../../models/houseHolds/houseHold')
var People = require('../../models/people/people')

var generateTargetResults = require('../target/generateTargetResults')

const downloadTarget = async(potentialActivity) => {
    try {

        var query = await generateTargetResults.generateTargetResults(potentialActivity)

        if(query['idByHousehold'] === 'HOUSEHOLD'){
            return await HouseHold.aggregate(query['agg']).allowDiskUse(true)
        }else if (query['idByHousehold'] === 'INDIVIDUAL'){
            return await People.aggregate(query['agg']).allowDiskUse(true)
        }else{
            return await Membership.aggregate(query['agg']).allowDiskUse(true)
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadTarget}
