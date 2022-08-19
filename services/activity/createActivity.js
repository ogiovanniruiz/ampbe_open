var Activity = require('../../models/activities/activity')



var GenerateActivityHHRecords = require('./generateActivityHHRecords')


const createActivity = async(details) => {
    try { 
        var newActivity = new Activity(details)

        GenerateActivityHHRecords.generateActivityHHRecords(newActivity)

        return newActivity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createActivity}
