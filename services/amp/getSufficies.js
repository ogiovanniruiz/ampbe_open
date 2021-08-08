const HouseHold = require('../../models/houseHolds/houseHold')

const getSufficies = async(boundary) => {
    try {
        var filter = {};
        var filterSet = [];

        if(boundary[0].properties.districtType && boundary[0].properties.districtType !== 'NONE'){

            var parameter = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
            for(var i = 0; i < boundary.length; i++){
                await filterSet.push(boundary[i].properties.identifier);
            }
            filter[parameter] = await { $in: filterSet}

        }else{
            filter = {_id : { $exists: true }}
        }

        var found = await HouseHold.aggregate([
            {"$match" : filter},
            {"$group" : {_id : "$_id.suffix"}},
            {"$group" : {'_id': null, 'ids': {'$push': '$_id'}}}
        ]);

        var dataIDs = []
        if (found.length){
            dataIDs = found[0].ids;
        }

        return dataIDs
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getSufficies}
