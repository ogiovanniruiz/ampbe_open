var Polygon = require('../../../models/shapes/polygon');
var Groups = require('../../../models/groups/group');

const deletePolygon = async(detail) => {
    try { 
        var groups = await Groups.find({"queries.polygons": detail._id})

        if(groups.length > 0){
            return {message: "Polygon is being used by groups. Please remove polygon from groups before deleting.", success: false}
        }

        await Polygon.deleteOne({_id: detail._id})
        
        return {message: "Polygon deleted successfully", success: true}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deletePolygon}
