
var generateTargetResults = require('../target/generateTargetResults')

var HouseHold = require('../../models/houseHolds/houseHold')
var People = require('../../models/people/people')
var Membership = require('../../models/organizations/membership')

var Activity = require('../../models/activities/activity')

const generateActivityHHRecords = async(newActivity) => {

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

    await Activity.updateOne({_id: newActivity._id},{$set: {idByHousehold: query['idByHousehold'], hhReady: true}})



}


module.exports = {generateActivityHHRecords}