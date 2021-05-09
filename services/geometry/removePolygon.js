var Polygon = require('../../models/targets/poly');
var ObjectId = require('mongodb').ObjectID;

const removePolygon = async(detail) => {
    try { 
        return await Polygon.deleteOne({_id: ObjectId(detail._id)})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removePolygon}
