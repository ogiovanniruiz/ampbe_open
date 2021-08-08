var Target = require('../../models/targets/target');

const createTarget = async(targetDetails) => {
    try {
        var target = await Target.findOne({'properties.name': targetDetails.properties.name});

        if(target){
            return {success: false, msg: "Target name already exists."}
        }

        var newCreatedTarget  = new Target(targetDetails);
        newCreatedTarget.save();

        return {success: true, target: newCreatedTarget, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTarget}
