var _ = require ('underscore')
var phonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')

const skipHouseHold = async(data) => {
    try {

        var houseHoldID = {}

        if(data.idBy === 'INDIVIDUAL' || data.idBy === 'HOUSEHOLD'){
            houseHoldID = {
                streetNum: data.houseHold._id.streetNum,
                prefix: data.houseHold._id.prefix,
                street: data.houseHold._id.street,
                suffix: data.houseHold._id.suffix,
                unit: data.houseHold._id.unit,
                city: data.houseHold._id.city,
                state: data.houseHold._id.state,
                zip: data.houseHold._id.zip,
            }
        }else{
            houseHoldID = {
                address: data.houseHold._id.address,
                city: data.houseHold._id.city,
                state: data.houseHold._id.state,
                zip: data.houseHold._id.zip,
            }
        }

        var pbHouseHoldRecord = await phonebankHouseHoldRecord.findOne({ activityID: data.activityID, 'houseHold._id': houseHoldID})
        
        pbHouseHoldRecord.passed = true
        return pbHouseHoldRecord.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {skipHouseHold}
