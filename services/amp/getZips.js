const HouseHold = require('../../models/houseHolds/houseHold')

const getZips = async(boundary) => {
    try {
        var filter = {};
        var filterSet = [];

       // if(boundary[0].properties.districtType && boundary[0].properties.districtType !== 'NONE'){

            var parameter = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
            for(var i = 0; i < boundary.length; i++){
                filterSet.push(boundary[i].properties.identifier);
            }
            filter[parameter] = { $in: filterSet}

       // }else{
          //  filter = {_id : { $exists: true }}
        //}

        return await HouseHold.distinct('_id.zip', filter)


        var found = await HouseHold.aggregate([
            {"$match" : filter},
            {"$group" : {_id : "$_id.zip"}},
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

module.exports = {getZips}
