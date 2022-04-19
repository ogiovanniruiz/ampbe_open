const HouseHold = require('../../models/houseHolds/houseHold')

const getCities = async(boundary) => {
    try {
        var filter = {};
        var filterSet = [];

        //if(boundary[0].properties.districtType && boundary[0].properties.districtType !== 'NONE'){

            var parameter = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
            for(var i = 0; i < boundary.length; i++){
                filterSet.push(boundary[i].properties.identifier);
            }
            filter[parameter] = { $in: filterSet}

        //}else{
            //filter = {_id : { $exists: true }}
        //}

        return await HouseHold.distinct('_id.city', filter)

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCities}
