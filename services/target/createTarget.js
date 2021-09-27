var Target = require('../../models/targets/target')
const createTarget = async(targetProperties) => {
    try { 

        var target = await Target.findOne({'properties.name': targetProperties.name})

        if(target){
            return {success: false, msg: "Target name already exists."}
        }

        var newTarget = {properties: targetProperties}
        var newCreatedTarget  = new Target(newTarget)

        newCreatedTarget.save()

        return {success: true, target: newCreatedTarget, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTarget}