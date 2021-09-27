var Activity = require('../../models/activities/activity')

var generateTargetResults = require('../target/generateTargetResults')

var HouseHold = require('../../models/houseHolds/houseHold')
var People = require('../../models/people/people')
var Membership = require('../../models/organizations/membership')


const createActivity = async(details) => {
    try { 
        var newActivity = new Activity(details)

        if(newActivity.activityType === "Texting"){
            var query = await generateTargetResults.generateTargetResults(newActivity)

            query['agg'].push({'$merge': { into: "textbankhouseholdrecords", on: "_id", whenNotMatched: "insert" }})

            if(query['idByHousehold'] === 'HOUSEHOLD'){
                await HouseHold.aggregate(query['agg']).allowDiskUse(true)
            }else if (query['idByHousehold'] === 'INDIVIDUAL'){
                await People.aggregate(query['agg']).allowDiskUse(true)
            }else{
                await Membership.aggregate(query['agg']).allowDiskUse(true)

            }
        }

        if(newActivity.activityType === "Phonebank"){

            var query = await generateTargetResults.generateTargetResults(newActivity)

            query['agg'].push({'$merge': { into: "phonebankhouseholdrecords", on: "_id", whenNotMatched: "insert" }})

            if(query['idByHousehold'] === 'HOUSEHOLD'){
                await HouseHold.aggregate(query['agg']).allowDiskUse(true)
            }else if (query['idByHousehold'] === 'INDIVIDUAL'){
                await People.aggregate(query['agg']).allowDiskUse(true)
            }else{
                await Membership.aggregate(query['agg']).allowDiskUse(true)
            }
        }

        if(newActivity.activityType === "Petition"){
            return newActivity.save()
        }

        if(newActivity.activityType === "Canvass"){
            var query = await generateTargetResults.generateTargetResults(newActivity)

            query['agg'].push({'$merge': { into: "canvasshouseholdrecords", on: "_id", whenNotMatched: "insert" }})

            if(query['idByHousehold'] === 'HOUSEHOLD'){
                await HouseHold.aggregate(query['agg']).allowDiskUse(true)
            }else if (query['idByHousehold'] === 'INDIVIDUAL'){
                await People.aggregate(query['agg']).allowDiskUse(true)
            }else{
                await Membership.aggregate(query['agg']).allowDiskUse(true)
            }
        }


        newActivity.idByHousehold = query['idByHousehold'];

        return newActivity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createActivity}
