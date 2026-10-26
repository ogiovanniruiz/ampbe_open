var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const swCall = async(call) => {
    try { 
        var newPhoneContactRecord = new ActivityContactRecord({phonebankContactDetails: call, activityType: "Phonebank"});
        return await newPhoneContactRecord.save();

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {swCall}