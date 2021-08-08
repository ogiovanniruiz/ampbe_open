var Target = require('../../models/targets/target')
var ObjectId = require('mongodb').ObjectID;

const removeTarget = async(detail) => {
    try { 
        console.log(detail)
        var target = await Target.deleteOne({_id: ObjectId(detail._id)})
        return target

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeTarget}