var Target = require('../../models/targets/target')
var ObjectId = require('mongodb').ObjectID;

const getTarget = async(detail) => {
    try { 
        return await Target.findOne({_id: ObjectId(detail._id)})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTarget}