const HouseHold = require('../../models/houseHolds/houseHold')

const searchAddress = async(address) => {
    try { 

        var filter = {}
        if(address.streetNum) filter['_id.streetNum'] = address.streetNum
        if(address.prefix) filter['_id.prefix'] = address.prefix
        if(address.street) filter['_id.street'] = address.street
        if(address.suffix) filter['_id.suffix'] = address.suffix
        if(address.city) filter['_id.city'] = address.city
        if(address.zip) filter['_id.zip'] = address.zip

        return await HouseHold.find(filter)    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {searchAddress}